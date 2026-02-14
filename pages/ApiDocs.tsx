import React, { useState, useEffect } from 'react';
import { Copy, Terminal, ChevronRight, Server, Globe } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { CustomEndpoint } from '../types';

const ApiDocs: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [customEndpoints, setCustomEndpoints] = useState<CustomEndpoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEndpoints = async () => {
      try {
        const q = query(collection(db, "custom_endpoints"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        setCustomEndpoints(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomEndpoint)));
      } catch (err) {
        console.error("Failed to fetch custom endpoints", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEndpoints();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">API Documentation</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Integrate Xplorixa's powerful user data capabilities into your applications.
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4">
        <h3 className="text-lg font-bold text-blue-700 dark:text-blue-300">Authentication Required</h3>
        <p className="text-blue-600 dark:text-blue-400">
          All API requests must include your API Key in the <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">x-api-key</code> header. 
          Contact an administrator to obtain a key.
        </p>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <ChevronRight className="text-primary mr-2" /> Core Endpoints
        </h2>

        {/* Endpoint 1 */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 text-xs font-bold text-white bg-green-500 rounded">GET</span>
              <code className="text-sm font-mono text-gray-700 dark:text-gray-300">/api/users/count</code>
            </div>
            <span className="text-xs text-gray-500">Rate limit: 100/min</span>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-gray-600 dark:text-gray-300">Retrieve the total number of registered users in the system.</p>
            
            <div className="relative">
              <div className="absolute top-2 right-2">
                <button 
                  onClick={() => copyToClipboard(`curl -H "x-api-key: YOUR_KEY" https://xplorixa.com/api/users/count`)}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <Copy size={16} />
                </button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`curl -X GET https://xplorixa.com/api/users/count \\
  -H "x-api-key: YOUR_API_KEY"`}
              </pre>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
              <span className="text-xs font-bold text-gray-500 uppercase block mb-2">Response</span>
              <pre className="text-sm text-green-600 dark:text-green-400 font-mono">
{`{
  "count": 1250,
  "timestamp": "2023-10-27T10:00:00Z"
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Endpoint 2 */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 text-xs font-bold text-white bg-green-500 rounded">GET</span>
              <code className="text-sm font-mono text-gray-700 dark:text-gray-300">/api/users/list</code>
            </div>
            <span className="text-xs text-gray-500">Rate limit: 50/min</span>
          </div>
          <div className="p-6 space-y-4">
             <p className="text-gray-600 dark:text-gray-300">Get a paginated list of users. Requires <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">FULL_ACCESS</code> scope.</p>
             <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`curl -X GET "https://xplorixa.com/api/users/list?page=1&limit=10" \\
  -H "x-api-key: YOUR_API_KEY"`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Managed APIs */}
      {customEndpoints.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
             <Globe className="text-indigo-500 mr-2" /> Managed Service APIs
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Below is a directory of additional APIs managed by this platform. 
            These are deployed services that can be accessed directly via their endpoints.
          </p>

          {customEndpoints.map(endpoint => (
             <div key={endpoint.id} className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 text-xs font-bold text-white rounded ${
                      endpoint.method === 'GET' ? 'bg-green-500' :
                      endpoint.method === 'POST' ? 'bg-blue-500' :
                      endpoint.method === 'DELETE' ? 'bg-red-500' : 'bg-orange-500'
                    }`}>{endpoint.method}</span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{endpoint.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">Auth Required: {endpoint.requiresAuth ? 'Yes' : 'No'}</span>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">{endpoint.description}</p>
                  
                  <div className="flex items-center gap-2 mb-2">
                     <span className="text-xs uppercase font-bold text-gray-500">Target URL</span>
                  </div>
                  <div className="relative">
                    <div className="absolute top-2 right-2">
                      <button 
                        onClick={() => copyToClipboard(`curl -X ${endpoint.method} "${endpoint.targetUrl}"`)}
                        className="p-1 text-gray-400 hover:text-white"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`curl -X ${endpoint.method} "${endpoint.targetUrl}" \\
  -H "x-api-key: YOUR_API_KEY"`}
                    </pre>
                  </div>
                </div>
             </div>
          ))}
        </section>
      )}

      <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Need an API Key?</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          API keys are currently managed by administrators. 
        </p>
        <a href="mailto:rowboxsiw@gmail.com?subject=API Key Request" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-600">
          Request Access via Email
        </a>
      </div>
    </div>
  );
};

export default ApiDocs;