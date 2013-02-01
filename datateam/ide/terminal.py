import os
import re
import sys
import signal
import subprocess
import pty
import fcntl
import struct
import termios
import datetime
import traceback
from base64 import b64decode, b64encode
INVALID_CHARS = re.compile(u'[\xe2\x80\x99]')
  
import pyte

TERM_W = 80
TERM_H = 24

def remove_invalid_char (value):
  return INVALID_CHARS.sub('', value)
  
class Terminal:
    def __init__(self):
        self._proc = None

    def start(self, app, home, width, height, tsid=None, onclose=None, screen=None):
        signal.signal(signal.SIGCHLD, signal.SIG_IGN)
        
        env = {}
        env.update(os.environ)
        env['TERM'] = 'linux'
        env['COLUMNS'] = str(width)
        env['LINES'] = str(height)
        env['LC_ALL'] = 'en_US.UTF8'
        sh = app
        self.lines = height
        self.cols = width
        
        pid, master = pty.fork()
        self.pid = pid
        if pid == 0:
            os.chdir(home)
            p = subprocess.Popen(
                sh,
                shell=True,
                close_fds=True,
                env=env,
            )
            try:
              p.wait()
            except OSError:
              pass
              #exit typed
              
            if onclose and tsid:
              onclose(tsid)
              
            sys.exit(0)
            
        self._proc = PTYProtocol(pid, master, width, height)
        self.resize(self.lines, self.cols)
        
    def restart(self):
        if self._proc is not None:
            self._proc.kill()
        self.start()
        
    def dead(self):
        return self._proc is None 

    def write(self, data):
        self._proc.write(data)
        #self._proc.write(b64decode(data))
        
    def resize (self, lines, columns):
        self.lines = lines
        self.cols = columns
        self._proc.resize(lines, columns)
        
class PTYProtocol():
    def __init__(self, proc, stream, width, height):
        self.data = ''
        self.proc = proc
        self.master = stream

        fd = self.master
        fl = fcntl.fcntl(fd, fcntl.F_GETFL)
        fcntl.fcntl(fd, fcntl.F_SETFL, fl | os.O_NONBLOCK)
        
        self.mstream = os.fdopen(self.master, 'r+')
        
        self.term = pyte.HistoryScreen(width, height, 1000)
        
        self.stream = pyte.ByteStream()
        self.stream.escape["N"] = "next_page"
        self.stream.escape["P"] = "prev_page"
        self.stream.attach(self.term)
        
        self.data = ''
        self.unblock()
        self.updated = None
        self.lastx = None
        self.lasty = None
        
    def resize (self, lines, columns):
      fd = self.master
      self.term.resize(lines, columns)
      s = struct.pack("HHHH", lines, columns, 0, 0)
      fcntl.ioctl(fd, termios.TIOCSWINSZ, s)
      self.term.reset()
      
    def unblock(self):
        fd = self.master
        fl = fcntl.fcntl(fd, fcntl.F_GETFL)
        fcntl.fcntl(fd, fcntl.F_SETFL, fl | os.O_NONBLOCK)

    def block(self):
        fd = self.master
        fl = fcntl.fcntl(fd, fcntl.F_GETFL)
        fcntl.fcntl(fd, fcntl.F_SETFL, fl - os.O_NONBLOCK)

    def read(self):
        for i in range(0, 45):
            try:
                d = self.mstream.read()
                self.data += d
                if len(self.data) > 0:
                    #u = unicode(remove_invalid_char(str(self.data)))
                    self.stream.feed(self.data)
                    self.data = ''
                    self.updated = datetime.datetime.now()
                    
                break
            except IOError, e:
                pass
                
            except UnicodeDecodeError, e:
                print 'UNICODE'
                print e
                import traceback
                traceback.print_exc()
                
        return self.format()

    def history(self):
        return self.format(full=True)

    def format(self, full=False):
        l = {}
        
        if self.lastx != self.term.cursor.x or self.lasty != self.term.cursor.y:
          self.lastx = self.term.cursor.x
          self.lasty = self.term.cursor.y
          self.updated = datetime.datetime.now()
          
        self.term.dirty.add(self.term.cursor.y)
        for k in self.term.dirty:
            try:
              l[k] = self.term[k]
              
            except:
              pass
              
        self.term.dirty.clear()
        r = {
            'lines': self.term if full else l,
            'cx': self.term.cursor.x,
            'cy': self.term.cursor.y,
            'cursor': not self.term.cursor.hidden,
        }
        return r

    def write(self, data):
        self.block()
        self.mstream.write(data)
        self.mstream.flush()
        self.unblock()
        