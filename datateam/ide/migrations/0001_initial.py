# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding model 'Preferences'
        db.create_table('ide_preferences', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('user', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['auth.User'], unique=True)),
            ('basedir', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('theme', self.gf('django.db.models.fields.CharField')(default='textmate', max_length=25)),
            ('fontsize', self.gf('django.db.models.fields.CharField')(default='12px', max_length=10)),
            ('keybind', self.gf('django.db.models.fields.CharField')(default='ace', max_length=10)),
            ('swrap', self.gf('django.db.models.fields.CharField')(default='off', max_length=10)),
            ('tabsize', self.gf('django.db.models.fields.IntegerField')(default=4)),
            ('hactive', self.gf('django.db.models.fields.BooleanField')(default=True)),
            ('hword', self.gf('django.db.models.fields.BooleanField')(default=True)),
            ('invisibles', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('gutter', self.gf('django.db.models.fields.BooleanField')(default=True)),
            ('pmargin', self.gf('django.db.models.fields.BooleanField')(default=True)),
            ('softab', self.gf('django.db.models.fields.BooleanField')(default=True)),
        ))
        db.send_create_signal('ide', ['Preferences'])


    def backwards(self, orm):
        
        # Deleting model 'Preferences'
        db.delete_table('ide_preferences')


    models = {
        'auth.group': {
            'Meta': {'object_name': 'Group'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        'auth.permission': {
            'Meta': {'ordering': "('content_type__app_label', 'content_type__model', 'codename')", 'unique_together': "(('content_type', 'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['contenttypes.ContentType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'ide.preferences': {
            'Meta': {'object_name': 'Preferences'},
            'basedir': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'fontsize': ('django.db.models.fields.CharField', [], {'default': "'12px'", 'max_length': '10'}),
            'gutter': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'hactive': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'hword': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'invisibles': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'keybind': ('django.db.models.fields.CharField', [], {'default': "'ace'", 'max_length': '10'}),
            'pmargin': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'softab': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'swrap': ('django.db.models.fields.CharField', [], {'default': "'off'", 'max_length': '10'}),
            'tabsize': ('django.db.models.fields.IntegerField', [], {'default': '4'}),
            'theme': ('django.db.models.fields.CharField', [], {'default': "'textmate'", 'max_length': '25'}),
            'user': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['auth.User']", 'unique': 'True'})
        }
    }

    complete_apps = ['ide']
