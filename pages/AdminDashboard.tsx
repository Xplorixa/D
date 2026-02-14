import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { db, rtdb } from '../services/firebase';
import { UserProfile, UserStatus, ApiKey, CustomEndpoint } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Key, Activity, Search, Trash2, Ban, CheckCircle, 
  Download, Plus, RefreshCw, Copy, Eye, EyeOff, Globe, ExternalLink, Server
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'keys' | 'apis'>('overview');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [endpoints, setEndpoints] = useState<CustomEndpoint[]>([]);
  const [realtimeCount, setRealtimeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { userProfile } = useAuth();
  
  // New Endpoint Form State
  const [newEndpoint, setNewEndpoint] = useState({
    name: '',
    targetUrl: '',
    description: '',
    method: 'GET',
    category: 'General'
  });
  
  // Charts Data State
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Realtime DB Listener
    const countRef = ref(rtdb, 'stats/userCount');
    const unsubscribe = onValue(countRef, (snapshot) => {
      setRealtimeCount(snapshot.val() || 0);
    });

    // Initial Fetch
    fetchUsers();
    fetchKeys();
    fetchEndpoints();

    return () => unsubscribe();
  }, []);

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const userList = snapshot.docs.map(doc => doc.data() as UserProfile);
      setUsers(userList);
      
      // Prepare Chart Data (Registration Trends - Mocking logic for example)
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();
      
      const trendData = last7Days.map(date => ({
        name: date.slice(5), // MM-DD
        registrations: userList.filter(u => u.createdAt.startsWith(date)).length
      }));
      setChartData(trendData);

    } catch (err) {
      console.error("Error fetching users", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchKeys = async () => {
    const q = query(collection(db, "api_keys"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    setApiKeys(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ApiKey)));
  };

  const fetchEndpoints = async () => {
    try {
      const q = query(collection(db, "custom_endpoints"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setEndpoints(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomEndpoint)));
    } catch (error) {
      console.error("Error fetching endpoints:", error);
    }
  };

  const toggleUserStatus = async (uid: string, currentStatus: UserStatus) => {
    const newStatus = currentStatus === UserStatus.ACTIVE ? UserStatus.BANNED : UserStatus.ACTIVE;
    await updateDoc(doc(db, "users", uid), { status: newStatus });
    fetchUsers();
  };

  const deleteUser = async (uid: string) => {
    if (window.confirm("Are you sure? This cannot be undone.")) {
      await deleteDoc(doc(db, "users", uid));
      fetchUsers();
    }
  };

  const deleteEndpoint = async (id: string) => {
    if (window.confirm("Delete this API endpoint?")) {
      await deleteDoc(doc(db, "custom_endpoints", id));
      fetchEndpoints();
    }
  };

  const generateApiKey = async (scope: 'READ_ONLY' | 'FULL_ACCESS') => {
    const newKey = 'sk_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
    const keyData = {
      key: newKey,
      createdBy: userProfile?.email,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      usageLimit: 10000,
      currentUsage: 0,
      scope,
      status: 'active'
    };
    await addDoc(collection(db, "api_keys"), keyData);
    fetchKeys();
  };

  const handleCreateEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEndpoint.name || !newEndpoint.targetUrl) return;

    try {
      await addDoc(collection(db, "custom_endpoints"), {
        ...newEndpoint,
        createdAt: new Date().toISOString(),
        requiresAuth: true
      });
      setNewEndpoint({ name: '', targetUrl: '', description: '', method: 'GET', category: 'General' });
      fetchEndpoints();
      alert("API Endpoint registered successfully");
    } catch (error) {
      console.error("Error creating endpoint:", error);
      alert("Failed to create endpoint");
    }
  };

  const exportCSV = () => {
    const headers = ["UID", "Name", "Email", "Role", "Status", "Joined"];
    const csvContent = [
      headers.join(","),
      ...users.map(u => [u.uid, u.fullName, u.email, u.role, u.status, u.createdAt].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString()}.csv`;
    a.click();
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <div className="flex space-x-2">
           <button onClick={exportCSV} className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
             <Download size={16} className="mr-2" /> Export CSV
           </button>
           <button onClick={() => { fetchUsers(); fetchKeys(); fetchEndpoints(); }} className="flex items-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
             <RefreshCw size={16} className="mr-2" /> Refresh
           </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full mr-4">
            <Users className="text-blue-600 dark:text-blue-300" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{realtimeCount}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center">
          <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full mr-4">
            <Key className="text-purple-600 dark:text-purple-300" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Active Keys</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{apiKeys.filter(k => k.status === 'active').length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full mr-4">
            <Globe className="text-indigo-600 dark:text-indigo-300" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Managed APIs</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{endpoints.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center">
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full mr-4">
            <Activity className="text-green-600 dark:text-green-300" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">System Status</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">Healthy</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`${activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            User Management
          </button>
          <button 
            onClick={() => setActiveTab('keys')}
            className={`${activeTab === 'keys' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            API Keys
          </button>
          <button 
            onClick={() => setActiveTab('apis')}
            className={`${activeTab === 'apis' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            API Management
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
           <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
             <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Registration Trends (Last 7 Days)</h3>
             <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData}>
                   <CartesianGrid strokeDasharray="3 3" />
                   <XAxis dataKey="name" stroke="#888888" />
                   <YAxis stroke="#888888" />
                   <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                   />
                   <Bar dataKey="registrations" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="text-gray-400" size={20} />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.uid}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full object-cover" src={user.photoURL || `https://ui-avatars.com/api/?name=${user.fullName}`} alt="" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{user.fullName}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === UserStatus.ACTIVE ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button 
                          onClick={() => toggleUserStatus(user.uid, user.status)}
                          className="text-yellow-600 hover:text-yellow-900 dark:hover:text-yellow-400"
                          title="Toggle Status"
                        >
                          <Ban size={18} />
                        </button>
                        <button 
                          onClick={() => deleteUser(user.uid)}
                          className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'keys' && (
          <div className="space-y-4">
            <div className="flex justify-end space-x-4">
               <button onClick={() => generateApiKey('READ_ONLY')} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                 <Plus size={16} className="mr-2" /> New Read Key
               </button>
               <button onClick={() => generateApiKey('FULL_ACCESS')} className="flex items-center px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                 <Plus size={16} className="mr-2" /> New Full Key
               </button>
            </div>
            
            <div className="grid gap-4">
              {apiKeys.map(key => (
                <div key={key.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-2">
                      <code className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-primary font-mono">{key.key}</code>
                      <button className="text-gray-400 hover:text-gray-600" onClick={() => navigator.clipboard.writeText(key.key)}>
                        <Copy size={14} />
                      </button>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Scope: <span className="font-semibold">{key.scope}</span> | Usage: {key.currentUsage}/{key.usageLimit}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 block">Expires: {new Date(key.expiresAt).toLocaleDateString()}</span>
                    <span className={`text-xs font-bold ${key.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
                      {key.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
              {apiKeys.length === 0 && <p className="text-center text-gray-500 py-8">No API Keys generated yet.</p>}
            </div>
          </div>
        )}

        {activeTab === 'apis' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Register New API Endpoint</h3>
              <form onSubmit={handleCreateEndpoint} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    placeholder="e.g. User Profile Service"
                    value={newEndpoint.name}
                    onChange={e => setNewEndpoint({...newEndpoint, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Original Deployment URL</label>
                  <input
                    type="url"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    placeholder="https://my-backend-service.com/api"
                    value={newEndpoint.targetUrl}
                    onChange={e => setNewEndpoint({...newEndpoint, targetUrl: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    placeholder="What does this API do?"
                    value={newEndpoint.description}
                    onChange={e => setNewEndpoint({...newEndpoint, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Method</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    value={newEndpoint.method}
                    onChange={e => setNewEndpoint({...newEndpoint, method: e.target.value})}
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                    <Plus size={16} className="mr-2" /> Register Endpoint
                  </button>
                </div>
              </form>
            </div>

            <div className="grid gap-4">
              {endpoints.map(ep => (
                <div key={ep.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${
                          ep.method === 'GET' ? 'bg-green-500' :
                          ep.method === 'POST' ? 'bg-blue-500' :
                          ep.method === 'DELETE' ? 'bg-red-500' : 'bg-orange-500'
                        }`}>
                          {ep.method}
                        </span>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{ep.name}</h4>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{ep.description}</p>
                      <div className="flex items-center gap-2 text-xs text-indigo-500">
                        <Server size={12} />
                        <a href={ep.targetUrl} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-md">
                          {ep.targetUrl}
                        </a>
                        <ExternalLink size={12} />
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteEndpoint(ep.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove Endpoint"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {endpoints.length === 0 && <p className="text-center text-gray-500 py-8">No managed APIs yet. Add one above.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;