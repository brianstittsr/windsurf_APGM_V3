'use client';

import { useState } from 'react';
import { getDb } from '@/lib/firebase';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';

export default function FirestorePermissionTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      // Step 1: Test reading a collection
      addResult('Starting test: Reading collections...');
      
      try {
        const db = getDb();
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        addResult(`✅ Successfully read users collection (${usersSnapshot.size} documents)`);
      } catch (error) {
        addResult(`❌ Error reading users collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      // Step 2: Test reading a document
      addResult('Testing: Reading a document...');
      
      try {
        const db = getDb();
        const settingsDoc = doc(db, 'businessSettings', 'main');
        const settingsSnap = await getDoc(settingsDoc);
        if (settingsSnap.exists()) {
          addResult('✅ Successfully read businessSettings/main document');
        } else {
          addResult('⚠️ businessSettings/main document does not exist');
        }
      } catch (error) {
        addResult(`❌ Error reading businessSettings document: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      // Step 3: Test writing to artist-availability collection
      addResult('Testing: Writing to artist-availability collection...');
      
      try {
        const db = getDb();
        const testDocRef = doc(db, 'artist-availability', 'test-permission');
        await setDoc(testDocRef, { 
          testField: 'permission-test',
          timestamp: new Date()
        });
        addResult('✅ Successfully wrote to artist-availability collection');
        
        // Verify the write
        const verifySnap = await getDoc(testDocRef);
        if (verifySnap.exists()) {
          addResult('✅ Successfully verified write to artist-availability/test-permission');
        } else {
          addResult('❌ Write verification failed - document not found');
        }
      } catch (error) {
        addResult(`❌ Error writing to artist-availability collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      // Step 4: Check if artist-availability collection exists and is readable
      addResult('Testing: Reading artist-availability collection...');
      
      try {
        const db = getDb();
        const availCollection = collection(db, 'artist-availability');
        const availSnapshot = await getDocs(availCollection);
        addResult(`✅ Successfully read artist-availability collection (${availSnapshot.size} documents)`);
      } catch (error) {
        addResult(`❌ Error reading artist-availability collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      addResult('Test complete! Check results above.');
      
    } catch (error) {
      addResult(`❌ Test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  const addResult = (message: string) => {
    console.log(message);
    setTestResults(prev => [...prev, message]);
  };

  return (
    <div className="card mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Firestore Permission Test</h5>
        <button 
          className="btn btn-sm btn-primary"
          onClick={runTest}
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Run Test'}
        </button>
      </div>
      <div className="card-body">
        <p className="card-text">
          This tool tests your Firestore permissions to diagnose any issues with saving availability.
        </p>
        
        {testResults.length > 0 && (
          <div className="mt-3 border rounded p-3 bg-light">
            <h6 className="mb-2">Test Results:</h6>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {testResults.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-3 small text-muted">
          Note: This test will attempt to write to the 'artist-availability' collection. 
          The test document will have ID 'test-permission'.
        </div>
      </div>
    </div>
  );
}
