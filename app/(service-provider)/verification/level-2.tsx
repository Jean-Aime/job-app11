import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Upload, FileText, CheckCircle, X } from 'lucide-react-native';
import { sql } from '@/lib/db';
import { useAuthStore } from '@/stores/authStore';
import { Palette } from '@/constants/theme';

export default function Level2VerificationScreen() {
  const { serviceProvider, user } = useAuthStore();
  const [documents, setDocuments] = useState<{ type: string; name: string; url: string }[]>([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const requiredDocs = [
    { type: 'skill_certificate', label: 'Skill Certificate', uploaded: false },
    { type: 'portfolio', label: 'Work Portfolio', uploaded: false },
    { type: 'reference', label: 'Reference Letter', uploaded: false }
  ];

  const handleUpload = (type: string) => {
    Alert.alert('Upload Document', `Uploading ${type}... (File upload integration pending)`, [
      {
        text: 'Simulate Upload',
        onPress: () => {
          setDocuments([...documents, { type, name: `${type}_document.pdf`, url: 'mock://url' }]);
        }
      },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const submitVerification = async () => {
    if (documents.length < 2) {
      Alert.alert('Missing Documents', 'Please upload at least 2 documents');
      return;
    }

    setSubmitting(true);
    try {
      const docIds = [];
      
      for (const doc of documents) {
        const result = await sql`
          INSERT INTO verification_documents (user_id, document_type, document_url, document_name)
          VALUES (${user?.id}, ${doc.type}, ${doc.url}, ${doc.name})
          RETURNING id
        `;
        docIds.push(result[0].id);
      }

      await sql`
        INSERT INTO verification_requests (
          service_provider_id, requested_level, current_level, document_ids, additional_notes
        )
        VALUES (
          ${serviceProvider?.id}, 2, ${serviceProvider?.verification_level || 1}, 
          ${JSON.stringify(docIds)}, ${notes}
        )
      `;

      Alert.alert('Success', 'Verification request submitted! We will review within 24 hours.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit verification request');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Palette.gray50 }}>
      <View style={{ backgroundColor: Palette.green600, paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: '#fff', fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: '800', color: '#fff', marginTop: 12 }}>Level 2 Verification</Text>
        <Text style={{ fontSize: 14, color: '#fff', opacity: 0.9, marginTop: 4 }}>Skill Verified</Text>
      </View>

      <ScrollView style={{ flex: 1, padding: 20 }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: Palette.gray900, marginBottom: 12 }}>
            Required Documents
          </Text>

          {requiredDocs.map((doc, idx) => {
            const uploaded = documents.some(d => d.type === doc.type);
            return (
              <View key={idx} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 16, color: Palette.gray800 }}>{doc.label}</Text>
                  {uploaded && <CheckCircle size={20} color={Palette.green600} />}
                </View>
                <TouchableOpacity
                  onPress={() => handleUpload(doc.type)}
                  disabled={uploaded}
                  style={{
                    borderWidth: 2,
                    borderColor: uploaded ? Palette.green600 : Palette.gray300,
                    borderStyle: 'dashed',
                    borderRadius: 12,
                    padding: 20,
                    alignItems: 'center',
                    backgroundColor: uploaded ? Palette.green50 : '#fff'
                  }}
                >
                  <Upload size={32} color={uploaded ? Palette.green600 : Palette.gray400} />
                  <Text style={{ fontSize: 14, color: uploaded ? Palette.green700 : Palette.gray600, marginTop: 8 }}>
                    {uploaded ? 'Uploaded' : 'Tap to upload'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {documents.length > 0 && (
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: Palette.gray900, marginBottom: 12 }}>
              Uploaded Files
            </Text>
            {documents.map((doc, idx) => (
              <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: 12, backgroundColor: Palette.gray50, borderRadius: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <FileText size={24} color={Palette.green600} />
                  <Text style={{ fontSize: 14, color: Palette.gray800, flex: 1 }} numberOfLines={1}>
                    {doc.name}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => removeDocument(idx)}>
                  <X size={20} color={Palette.red500} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: Palette.gray900, marginBottom: 8 }}>
            Additional Notes
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any additional information..."
            multiline
            numberOfLines={4}
            style={{
              borderWidth: 1,
              borderColor: Palette.gray300,
              borderRadius: 8,
              padding: 12,
              fontSize: 14,
              color: Palette.gray800,
              textAlignVertical: 'top'
            }}
          />
        </View>

        <TouchableOpacity
          onPress={submitVerification}
          disabled={submitting || documents.length < 2}
          style={{
            backgroundColor: submitting || documents.length < 2 ? Palette.gray300 : Palette.green600,
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 40
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
            {submitting ? 'Submitting...' : 'Submit for Review'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
