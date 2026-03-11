import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Search, 
  Mic, 
  BarChart3, 
  PieChart, 
  LineChart, 
  TrendingUp, 
  MessageSquare, 
  Download, 
  Share2, 
  FileText,
  LayoutDashboard,
  Sparkles,
  ArrowRight,
  Database,
  Zap,
  ShieldCheck,
  Moon,
  Sun,
  Menu,
  X,
  ChevronRight,
  Globe,
  Cpu,
  Layers,
  Activity,
  User,
  Send,
  MoreVertical,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  History,
  Table as TableIcon,
  RefreshCw,
  Upload,
  CheckCircle2,
  AlertCircle,
  Lock,
  Mail,
  Github,
  Chrome
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart as ReLineChart, 
  Line, 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  ReferenceLine
} from 'recharts';
import { getDashboardStructure, getAIAnalystResponse } from './services/gemini';
import { aggregateData, calculateMetrics, parseFile } from './utils/dataUtils';
import { SalesData, DashboardConfig, GenericData } from './types';
import confetti from 'canvas-confetti';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// --- Components ---

const DataUpload = ({ onUploadComplete, onClose }: { onUploadComplete: (data: GenericData[]) => void, onClose: () => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [previewData, setPreviewData] = useState<GenericData[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploadStatus('uploading');
    setError(null);
    try {
      const parsedData = await parseFile(file);
      setPreviewData(parsedData.slice(0, 5));
      setUploadStatus('success');
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Store data after a short delay to show success state
      setTimeout(() => {
        onUploadComplete(parsedData);
      }, 2000);
    } catch (err: any) {
      setUploadStatus('error');
      setError(err.message || 'Failed to parse file');
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
    >
      <GlassCard className="w-full max-w-2xl p-8 relative">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors">
          <X className="w-5 h-5 text-slate-400" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-black tracking-tighter mb-2">Upload Dataset</h2>
          <p className="text-slate-400">Import CSV, Excel, or JSON files for instant analysis.</p>
        </div>

        {uploadStatus === 'idle' || uploadStatus === 'uploading' ? (
          <div 
            className={`upload-area ${isDragging ? 'dragging' : ''} ${uploadStatus === 'uploading' ? 'pointer-events-none opacity-50' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={onFileSelect} 
              accept=".csv,.xlsx,.xls,.json" 
              className="hidden" 
            />
            <div className="w-20 h-20 bg-neon-blue/10 rounded-3xl flex items-center justify-center mb-6">
              {uploadStatus === 'uploading' ? (
                <RefreshCw className="w-10 h-10 text-neon-blue animate-spin" />
              ) : (
                <Upload className="w-10 h-10 text-neon-blue" />
              )}
            </div>
            <p className="text-lg font-bold mb-2">
              {uploadStatus === 'uploading' ? 'Processing File...' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-sm text-slate-500">CSV, XLSX, XLS, or JSON (max 50MB)</p>
          </div>
        ) : uploadStatus === 'success' ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-6 text-emerald-500">
              <CheckCircle2 className="w-16 h-16 mb-4" />
              <h3 className="text-xl font-bold">Upload Successful!</h3>
              <p className="text-sm text-slate-400 mt-1">Your data is ready for analysis.</p>
            </div>

            {previewData && (
              <div className="glass rounded-2xl overflow-hidden">
                <div className="px-4 py-2 bg-white/5 border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Data Preview (First 5 Rows)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5">
                        {Object.keys(previewData[0]).map(key => (
                          <th key={key} className="px-4 py-3 font-bold text-slate-300">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, i) => (
                        <tr key={i} className="border-b border-white/5 last:border-0">
                          {Object.values(row).map((val, j) => (
                            <td key={j} className="px-4 py-3 text-slate-400 truncate max-w-[150px]">
                              {String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            <div className="flex justify-center">
              <div className="flex items-center gap-2 text-xs font-bold text-neon-blue animate-pulse">
                <Sparkles className="w-4 h-4" /> Initializing AI Analysis...
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-rose-500">
            <AlertCircle className="w-16 h-16 mb-4" />
            <h3 className="text-xl font-bold">Upload Failed</h3>
            <p className="text-sm text-slate-400 mt-1 mb-8">{error}</p>
            <button 
              onClick={() => setUploadStatus('idle')}
              className="px-8 py-3 glass hover:bg-white/10 rounded-xl font-bold text-white transition-all"
            >
              Try Again
            </button>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
};

const LoginModal = ({ onLogin, onLogout, onClose, currentUser }: { onLogin: (user: any) => void, onLogout: () => void, onClose: () => void, currentUser: any }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      onLogin({ name: email.split('@')[0], email, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}` });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
    >
      <GlassCard className="w-full max-w-md p-8 relative border-white/10 shadow-[0_0_50px_rgba(79,156,255,0.2)]">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors">
          <X className="w-5 h-5 text-slate-400" />
        </button>

        {currentUser ? (
          <div className="text-center py-4">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full rounded-2xl border-2 border-neon-blue shadow-[0_0_20px_rgba(79,156,255,0.3)]" />
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full border-4 border-[#0f0f0f]" />
            </div>
            <h2 className="text-3xl font-black tracking-tighter mb-2">Welcome Back</h2>
            <p className="text-slate-400 mb-8">You are currently signed in as <span className="text-white font-bold">{currentUser.email}</span></p>
            
            <div className="space-y-4">
              <button 
                onClick={onClose}
                className="w-full py-4 bg-gradient-to-r from-neon-blue to-electric-purple text-white rounded-xl font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-neon-blue/20"
              >
                Continue to Dashboard
              </button>
              <button 
                onClick={onLogout}
                className="w-full py-4 glass hover:bg-white/10 rounded-xl font-black text-slate-400 hover:text-rose-500 transition-all flex items-center justify-center gap-2"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-tr from-neon-blue to-electric-purple rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-black tracking-tighter mb-2">Welcome Back</h2>
              <p className="text-slate-400">Sign in to access your intelligence dashboard.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-neon-blue/50 transition-all"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-neon-blue/50 transition-all"
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-neon-blue to-electric-purple text-white rounded-xl font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-neon-blue/20 flex items-center justify-center gap-3"
              >
                {isLoading ? <RefreshCw className="w-6 h-6 animate-spin" /> : "Sign In"}
              </button>
            </form>

            <div className="mt-8">
              <div className="relative flex items-center justify-center mb-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <span className="relative px-4 bg-[#0f0f0f] text-xs font-bold text-slate-500 uppercase tracking-widest">Or continue with</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 py-3 glass hover:bg-white/10 rounded-xl text-sm font-bold transition-all">
                  <Github className="w-5 h-5" /> GitHub
                </button>
                <button className="flex items-center justify-center gap-2 py-3 glass hover:bg-white/10 rounded-xl text-sm font-bold transition-all">
                  <Chrome className="w-5 h-5" /> Google
                </button>
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-slate-500">
              Don't have an account? <a href="#" className="text-neon-blue font-bold hover:underline">Create one</a>
            </p>
          </>
        )}
      </GlassCard>
    </motion.div>
  );
};

const ParticleBackground = () => {
  return (
    <div className="particle-bg overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-30">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10,
            }}
          />
        ))}
      </div>
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-neon-blue/10 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-electric-purple/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
    </div>
  );
};

const GlassCard = ({ children, className = "", ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className={`glass-premium rounded-3xl overflow-hidden ${className}`} 
    {...props}
  >
    {children}
  </motion.div>
);

const Sparkline = ({ data, color }: { data: any[], color: string }) => (
  <div className="h-12 w-24">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.1} strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const MetricCard = ({ label, value, change, prefix = "", suffix = "", sparkData }: any) => (
  <GlassCard className="p-6 flex flex-col justify-between h-full relative group">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue to-electric-purple opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-white/5 rounded-lg">
        <Activity className="w-4 h-4 text-neon-blue" />
      </div>
      {change && (
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${change > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
          {change > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(change)}%
        </div>
      )}
    </div>
    <div className="flex items-end justify-between">
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-white tracking-tight">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </h3>
      </div>
      <Sparkline data={sparkData || [{value: 10}, {value: 20}, {value: 15}, {value: 30}]} color={change > 0 ? '#10b981' : '#f43f5e'} />
    </div>
  </GlassCard>
);

const ChartContainer = ({ title, children, ...props }: { title: string, children: React.ReactNode, [key: string]: any }) => (
  <GlassCard className="p-6 h-[400px] flex flex-col" {...props}>
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2">
        <div className="w-1 h-4 bg-neon-blue rounded-full" />
        {title}
      </h3>
      <button className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
        <MoreVertical className="w-4 h-4 text-slate-400" />
      </button>
    </div>
    <div className="flex-1 w-full">
      {children}
    </div>
  </GlassCard>
);

const TypingText = ({ text, delay = 0 }: { text: string, delay?: number }) => {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const timer = setTimeout(() => {
      let i = 0;
      interval = setInterval(() => {
        setDisplayedText(text.slice(0, i));
        i++;
        if (i > text.length) clearInterval(interval);
      }, 20);
    }, delay);
    return () => {
      clearTimeout(timer);
      if (interval) clearInterval(interval);
    };
  }, [text, delay]);

  return <span>{displayedText}</span>;
};

const Waveform = () => (
  <div className="flex items-center gap-1 h-8">
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="w-1 bg-neon-blue rounded-full"
        animate={{
          height: [8, 24, 8],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          delay: i * 0.1,
        }}
      />
    ))}
  </div>
);

const Dashboard = ({ config, data, onDrillDown, onGenerateInsights, onToast }: { config: DashboardConfig, data: SalesData[], onDrillDown: (xAxis: string, value: string) => void, onGenerateInsights: () => void, onToast: (msg: string, type: 'success' | 'error') => void }) => {
  const exportPDF = async () => {
    const element = document.getElementById('dashboard-content');
    if (!element) return;
    onToast("Generating PDF report...", "success");
    try {
      const canvas = await html2canvas(element, { backgroundColor: '#0f0f0f' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('insightgenie-dashboard.pdf');
      onToast("PDF report downloaded", "success");
    } catch (err) {
      onToast("PDF generation failed", "error");
    }
  };

  const exportCSV = () => {
    try {
      const headers = Object.keys(data[0]).join(",");
      const rows = data.map(row => Object.values(row).join(",")).join("\n");
      const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "insightgenie-data.csv");
      document.body.appendChild(link);
      link.click();
      onToast("Data exported to CSV", "success");
    } catch (err) {
      onToast("CSV export failed", "error");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    onToast("Dashboard link copied to clipboard", "success");
  };

  const topProducts = useMemo(() => {
    const map = new Map<string, { revenue: number, units: number }>();
    data.forEach(d => {
      const current = map.get(d.product) || { revenue: 0, units: 0 };
      map.set(d.product, { 
        revenue: current.revenue + d.revenue, 
        units: current.units + d.units 
      });
    });
    return Array.from(map.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [data]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" id="dashboard-content">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white text-glow">Intelligence Dashboard</h2>
          <p className="text-slate-400 flex items-center gap-2">
            <Activity className="w-4 h-4 text-neon-blue" /> Live analysis of {data.length.toLocaleString()} transactions
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 glass hover:bg-white/10 rounded-xl text-sm font-medium transition-all group">
            <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" /> PDF
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 glass hover:bg-white/10 rounded-xl text-sm font-medium transition-all group">
            <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" /> CSV
          </button>
          <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-neon-blue to-electric-purple text-white rounded-xl text-sm font-bold hover:shadow-[0_0_20px_rgba(79,156,255,0.4)] transition-all">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {config.metrics.map((metric, i) => (
          <MetricCard key={i} {...metric} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {config.charts.map((chart, i) => (
          <ChartContainer key={i} title={chart.title}>
            <ResponsiveContainer width="100%" height="100%">
              {chart.type === 'bar' ? (
                <BarChart data={chart.data} onClick={(state) => state && state.activeLabel !== undefined && onDrillDown(chart.xAxis, String(state.activeLabel))}>
                  <defs>
                    <linearGradient id={`barGradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f9cff" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#7c5cff" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                  />
                  <Bar dataKey="value" fill={`url(#barGradient-${i})`} radius={[6, 6, 0, 0]} cursor="pointer" />
                </BarChart>
              ) : chart.type === 'line' ? (
                <ReLineChart data={chart.data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#4f9cff" strokeWidth={4} dot={{ r: 4, fill: '#4f9cff', strokeWidth: 2, stroke: '#0f0f0f' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                </ReLineChart>
              ) : chart.type === 'area' ? (
                <AreaChart data={chart.data}>
                  <defs>
                    <linearGradient id={`areaGradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f9cff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f9cff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#4f9cff" fillOpacity={1} fill={`url(#areaGradient-${i})`} strokeWidth={4} />
                </AreaChart>
              ) : (
                <RePieChart>
                  <Pie
                    data={chart.data}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                    onClick={(entry) => onDrillDown(chart.xAxis, String(entry.name))}
                  >
                    {chart.data.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cursor="pointer" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </RePieChart>
              )}
            </ResponsiveContainer>
          </ChartContainer>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products Table */}
        <GlassCard className="lg:col-span-2 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2">
              <div className="w-1 h-4 bg-electric-purple rounded-full" />
              Top Performing Products
            </h3>
            <div className="flex gap-2">
              <button className="p-2 glass rounded-lg hover:bg-white/10 transition-colors"><TableIcon className="w-4 h-4" /></button>
              <button className="p-2 glass rounded-lg hover:bg-white/10 transition-colors"><RefreshCw className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-white/5">
                  <th className="pb-4 font-medium">Product Name</th>
                  <th className="pb-4 font-medium">Units Sold</th>
                  <th className="pb-4 font-medium">Revenue</th>
                  <th className="pb-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {topProducts.map((p, i) => (
                  <tr key={i} className="border-b border-white/5 group hover:bg-white/5 transition-colors">
                    <td className="py-4 font-medium text-white">{p.name}</td>
                    <td className="py-4 text-slate-400">{p.units.toLocaleString()}</td>
                    <td className="py-4 text-white font-bold">${p.revenue.toLocaleString()}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-xs text-emerald-500 font-bold">Trending</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* AI Insight Panel */}
        <GlassCard className="p-6 bg-gradient-to-br from-white/5 to-indigo-500/5 border-indigo-500/20">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-indigo-500/20 rounded-xl">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white">AI Insights</h3>
          </div>
          <div className="space-y-6">
            {config.insights.map((insight, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.2 }}
                className="relative pl-6 border-l border-white/10"
              >
                <div className="absolute left-[-4px] top-0 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                <p className="text-slate-300 text-sm leading-relaxed">
                  <TypingText text={insight} delay={1000 + i * 500} />
                </p>
              </motion.div>
            ))}
          </div>
          <button onClick={onGenerateInsights} className="w-full mt-8 py-3 glass hover:bg-white/10 rounded-xl text-xs font-bold text-indigo-400 uppercase tracking-widest transition-all">
            Generate More Insights
          </button>
        </GlassCard>
      </div>
    </div>
  );
};

const ChatPanel = ({ data, currentConfig }: { data: SalesData[], currentConfig: DashboardConfig | null }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "I'm Genie, your AI data analyst. How can I help you explore your business metrics today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput("");
    setIsTyping(true);

    try {
      const summary = `Total records: ${data.length}. Regions: ${[...new Set(data.map(d => d.region))].join(", ")}. Categories: ${[...new Set(data.map(d => d.category))].join(", ")}. Current Dashboard Insights: ${currentConfig?.insights.join(". ")}`;
      const response = await getAIAnalystResponse(userMsg, summary);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "I encountered an error processing your request. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <GlassCard className="flex flex-col h-full overflow-hidden border-white/5">
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-tr from-neon-blue to-electric-purple rounded-full flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0f0f0f] rounded-full" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Genie AI</h3>
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Online</p>
          </div>
        </div>
        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <MoreVertical className="w-4 h-4 text-slate-500" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none shadow-[0_4px_15px_rgba(79,70,229,0.3)]' 
                : 'glass text-slate-300 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="glass p-4 rounded-2xl rounded-tl-none flex gap-1.5">
              <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
              <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
              <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
            </div>
          </div>
        )}
      </div>
      <div className="p-5 border-t border-white/5">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Genie anything..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/50 transition-all"
          />
          <button onClick={handleSend} className="absolute right-2 top-2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </GlassCard>
  );
};

const COLORS = ['#4f9cff', '#7c5cff', '#00f2ff', '#ec4899', '#f59e0b', '#10b981'];

const LandingPage = ({ onStart, onLoginClick, user, query, setQuery }: { onStart: () => void, onLoginClick: () => void, user: any, query: string, setQuery: (q: string) => void }) => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -500]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white overflow-x-hidden">
      <ParticleBackground />

      {/* Navigation */}
      <nav className="relative z-50 flex justify-between items-center px-8 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-tr from-neon-blue to-electric-purple rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(79,156,255,0.3)]">
            <Cpu className="text-white w-7 h-7" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-glow">InsightGenie</span>
        </div>
        <div className="hidden md:flex items-center gap-10 text-sm font-bold uppercase tracking-widest text-slate-400">
          <a href="#platform" className="hover:text-white transition-colors">Platform</a>
          <a href="#intelligence" className="hover:text-white transition-colors">Intelligence</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          {user ? (
            <div className="flex items-center gap-3 px-4 py-2 glass rounded-full cursor-pointer hover:bg-white/10 transition-all" onClick={onLoginClick}>
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-white/20" />
              <span className="text-white font-black lowercase">@{user.name}</span>
            </div>
          ) : (
            <button onClick={onLoginClick} className="hover:text-white transition-colors">Login</button>
          )}
          <button onClick={onStart} className="px-8 py-3 bg-white text-black rounded-full hover:bg-neon-blue hover:text-white transition-all font-black">
            Launch App
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-40 px-8 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-neon-blue text-xs font-black uppercase tracking-[0.2em] mb-10">
            <Zap className="w-4 h-4" /> Next-Gen Data Intelligence
          </div>
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.9] text-glow">
            Talk to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-electric-purple to-soft-cyan animate-gradient-x">Your Data</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-14 leading-relaxed font-medium">
            Ask complex business questions and watch as InsightGenie generates professional dashboards, deep analysis, and predictive insights in real-time.
          </p>
          
          {/* Hero Search Bar */}
          <div className="max-w-2xl mx-auto mb-16 relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue to-electric-purple rounded-3xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative glass-premium p-2 flex items-center gap-3">
              <div className="pl-4 text-slate-500"><Search className="w-6 h-6" /></div>
              <div className="flex-1 text-left">
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && onStart()}
                  placeholder="Show monthly revenue trend for electronics..."
                  className="w-full bg-transparent border-none py-4 text-lg text-white font-medium focus:outline-none placeholder:text-slate-500"
                />
              </div>
              <button onClick={onStart} className="px-8 py-4 bg-white text-black rounded-2xl font-black hover:bg-neon-blue hover:text-white transition-all">
                Analyze
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button onClick={onStart} className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-neon-blue to-electric-purple text-white rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-[0_0_30px_rgba(79,156,255,0.3)] flex items-center justify-center gap-3 group">
              Get Started Free <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-10 py-5 glass hover:bg-white/10 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3">
              Watch AI in Action
            </button>
          </div>
        </motion.div>

        {/* Parallax Floating Widgets */}
        <div className="mt-32 relative h-[600px] hidden lg:block">
          <motion.div style={{ y: y1 }} className="absolute top-0 left-0 w-80">
            <GlassCard className="p-6 border-neon-blue/30">
              <div className="flex justify-between items-center mb-4">
                <div className="w-10 h-10 bg-neon-blue/20 rounded-xl flex items-center justify-center"><TrendingUp className="text-neon-blue" /></div>
                <div className="text-emerald-500 font-bold">+24.5%</div>
              </div>
              <div className="text-2xl font-black">$1.2M</div>
              <div className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">Quarterly Revenue</div>
              <div className="mt-4 h-12 bg-white/5 rounded-lg animate-pulse" />
            </GlassCard>
          </motion.div>

          <motion.div style={{ y: y2 }} className="absolute top-40 right-0 w-96">
            <GlassCard className="p-6 border-electric-purple/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-electric-purple/20 rounded-full flex items-center justify-center"><Sparkles className="w-4 h-4 text-electric-purple" /></div>
                <div className="text-sm font-bold">AI Insight</div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed italic">"Revenue peaked in September due to a 42% surge in electronics sales across the North region."</p>
            </GlassCard>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px]"
          >
            <GlassCard className="p-4 border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-500">InsightGenie Core v2.4</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 h-80 bg-white/5 rounded-2xl p-6 border border-white/5">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-sm font-bold text-slate-300">Revenue Performance</h4>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-neon-blue" />
                      <div className="w-2 h-2 rounded-full bg-electric-purple" />
                    </div>
                  </div>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: 'W1', v: 400, v2: 240 },
                        { name: 'W2', v: 300, v2: 139 },
                        { name: 'W3', v: 600, v2: 980 },
                        { name: 'W4', v: 800, v2: 390 },
                        { name: 'W5', v: 500, v2: 480 },
                        { name: 'W6', v: 900, v2: 380 },
                      ]}>
                        <defs>
                          <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f9cff" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#4f9cff" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" hide />
                        <YAxis hide />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="v" stroke="#4f9cff" fillOpacity={1} fill="url(#colorV)" strokeWidth={3} />
                        <Area type="monotone" dataKey="v2" stroke="#7c5cff" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-36 bg-white/5 rounded-2xl p-4 border border-white/5">
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Conversion Rate</div>
                    <div className="text-2xl font-black text-neon-blue">3.8%</div>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold mt-1">
                      <TrendingUp className="w-3 h-3" /> +12%
                    </div>
                    <div className="mt-4 h-8 flex items-end gap-1">
                      {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                        <div key={i} className="flex-1 bg-neon-blue/20 rounded-t-sm" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="h-40 bg-white/5 rounded-2xl p-4 border border-white/5">
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">Top Regions</div>
                    <div className="space-y-3">
                      {[
                        { label: 'North', val: 85, color: 'bg-neon-blue' },
                        { label: 'South', val: 65, color: 'bg-electric-purple' },
                        { label: 'West', val: 45, color: 'bg-soft-cyan' }
                      ].map((r, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span>{r.label}</span>
                            <span>{r.val}%</span>
                          </div>
                          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full ${r.color}`} style={{ width: `${r.val}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="platform" className="py-32 px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="relative">
            <div className="absolute -inset-10 bg-rose-500/10 blur-[100px] rounded-full" />
            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">Traditional BI is <br /><span className="text-rose-500">Too Slow.</span></h2>
            <p className="text-lg text-slate-400 mb-10 leading-relaxed">
              Waiting days for data analysts to build dashboards is a thing of the past. Business moves fast, and your insights should too.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: "Manual SQL", desc: "Requires technical expertise" },
                { title: "Static Reports", desc: "Outdated by the time they're ready" },
                { title: "Data Silos", desc: "Hard to get a unified view" },
                { title: "High Cost", desc: "Expensive analyst teams" }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="mt-1 p-1 bg-rose-500/20 rounded-full"><X className="w-4 h-4 text-rose-500" /></div>
                  <div>
                    <h4 className="font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-10 bg-neon-blue/10 blur-[100px] rounded-full" />
            <GlassCard className="p-10 border-neon-blue/30 bg-neon-blue/5">
              <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">InsightGenie is <br /><span className="text-neon-blue">Instant.</span></h2>
              <p className="text-lg text-slate-400 mb-10 leading-relaxed">
                Connect your data source and start asking questions. No SQL, no training, just answers.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { title: "Natural Language", desc: "Ask like you're in a meeting" },
                  { title: "Real-time Dashboards", desc: "Generated in seconds" },
                  { title: "Unified View", desc: "All your data in one place" },
                  { title: "AI Proactive", desc: "Insights you didn't think to ask" }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="mt-1 p-1 bg-neon-blue/20 rounded-full"><ShieldCheck className="w-4 h-4 text-neon-blue" /></div>
                    <div>
                      <h4 className="font-bold text-white">{item.title}</h4>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="intelligence" className="py-32 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-black mb-6">Master Your Data</h2>
          <p className="text-xl text-slate-400">The most powerful analytics engine ever built for executives.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: <MessageSquare />, title: "Conversational", desc: "Ask complex questions and get instant visual answers." },
            { icon: <LayoutDashboard />, title: "Auto-Dashboards", desc: "AI determines the best charts for your specific data query." },
            { icon: <Sparkles />, title: "Proactive Insights", desc: "Genie finds trends and anomalies before they become problems." },
            { icon: <Mic />, title: "Voice Analytics", desc: "Hands-free data exploration with advanced voice recognition." }
          ].map((f, i) => (
            <GlassCard key={i} className="p-10 group hover:border-neon-blue/50 transition-all">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-neon-blue group-hover:text-white transition-all shadow-lg">
                {React.cloneElement(f.icon as React.ReactElement, { className: "w-8 h-8" })}
              </div>
              <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
              <p className="text-slate-400 leading-relaxed">{f.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black mb-6">Simple Pricing</h2>
          <p className="text-xl text-slate-400 font-medium">Scale your intelligence as you grow.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "Starter", price: "0", features: ["1,000 records/mo", "Basic AI Analysis", "Standard Charts", "Community Support"] },
            { name: "Pro", price: "49", features: ["100,000 records/mo", "Advanced AI Insights", "Custom Branding", "Priority Support"], popular: true },
            { name: "Enterprise", price: "Custom", features: ["Unlimited records", "Dedicated AI Model", "SSO & Security", "24/7 Support"] }
          ].map((plan, i) => (
            <GlassCard key={i} className={`p-10 relative overflow-hidden ${plan.popular ? 'border-neon-blue/50 bg-neon-blue/5' : 'border-white/5'}`}>
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-neon-blue text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-bl-xl">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-black">${plan.price}</span>
                {plan.price !== "Custom" && <span className="text-slate-500 font-bold">/mo</span>}
              </div>
              <ul className="space-y-4 mb-10">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm text-slate-400 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={onStart} className={`w-full py-4 rounded-xl font-black transition-all ${plan.popular ? 'bg-neon-blue text-white shadow-lg shadow-neon-blue/20' : 'bg-white text-black hover:bg-neon-blue hover:text-white'}`}>
                Get Started
              </button>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-neon-blue to-electric-purple rounded-xl flex items-center justify-center">
              <Cpu className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tighter">InsightGenie</span>
          </div>
          <div className="flex gap-10 text-xs font-bold uppercase tracking-widest text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="text-slate-600 text-xs font-medium">
            © 2026 InsightGenie AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<SalesData[]>([]);
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [showUpload, setShowUpload] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);

  const handleQuery = async (e?: React.FormEvent, overrideQuery?: string, overrideData?: any[]) => {
    e?.preventDefault();
    const finalQuery = overrideQuery || query;
    if (!finalQuery.trim()) return;

    const finalData = overrideData || data;
    setIsLoading(true);
    setError(null);
    try {
      const config = await getDashboardStructure(finalQuery, finalData.slice(0, 5));
      
      // Merge AI filters with potential manual filters (drill-down)
      const mergedFilters = { ...config.filters, ...activeFilters };

      const processedCharts = config.charts.map((chart: any) => ({
        ...chart,
        data: aggregateData(finalData, chart.xAxis, chart.yAxis, mergedFilters)
      }));

      const metrics = calculateMetrics(finalData, mergedFilters);

      setDashboardConfig({
        metrics,
        charts: processedCharts,
        insights: config.insights,
        filters: mergedFilters
      });
      
      setQueryHistory(prev => [finalQuery, ...prev.slice(0, 4)]);
      
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#4f9cff', '#7c5cff', '#00f2ff']
      });
      
      setToast({ message: "Analysis complete", type: 'success' });
    } catch (err: any) {
      console.error(err);
      setError("Genie encountered an error while analyzing your data. Please try a different query.");
      setToast({ message: "Analysis failed", type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const generateMoreInsights = async () => {
    if (!dashboardConfig) return;
    setIsLoading(true);
    try {
      const summary = `Data has ${data.length} records. Current insights: ${dashboardConfig.insights.join(". ")}`;
      const newInsight = await getAIAnalystResponse("Provide one more deep business insight based on the data trends.", summary);
      setDashboardConfig({
        ...dashboardConfig,
        insights: [...dashboardConfig.insights, newInsight]
      });
      setToast({ message: "New insight generated", type: 'success' });
    } catch (err) {
      setToast({ message: "Failed to generate insight", type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrillDown = (xAxis: string, value: string) => {
    let newFilters = { ...activeFilters };
    
    // Robust key finding for filters
    const possibleKeys = [xAxis, xAxis.toLowerCase(), xAxis.replace(/s$/, ''), xAxis.toLowerCase().replace(/s$/, '')];
    const filterKey = possibleKeys.find(k => k === 'region' || k === 'category' || k === 'product' || k === 'customer') || xAxis.toLowerCase();
    
    const pluralKey = filterKey.endsWith('s') ? filterKey : 
                     filterKey.endsWith('y') ? filterKey.replace(/y$/, 'ies') : 
                     `${filterKey}s`;
                     
    newFilters[pluralKey] = [value];
    
    setActiveFilters(newFilters);
    setToast({ message: `Filtered by ${value}`, type: 'success' });
    
    // Re-run the current dashboard config with new filters
    if (dashboardConfig) {
      const processedCharts = dashboardConfig.charts.map((chart: any) => ({
        ...chart,
        data: aggregateData(data, chart.xAxis, chart.yAxis, newFilters)
      }));
      const metrics = calculateMetrics(data, newFilters);
      setDashboardConfig({
        ...dashboardConfig,
        metrics,
        charts: processedCharts,
        filters: newFilters
      });
    }
  };

  const clearFilters = () => {
    setActiveFilters({});
    if (dashboardConfig) {
      const processedCharts = dashboardConfig.charts.map((chart: any) => ({
        ...chart,
        data: aggregateData(data, chart.xAxis, chart.yAxis, {})
      }));
      const metrics = calculateMetrics(data, {});
      setDashboardConfig({
        ...dashboardConfig,
        metrics,
        charts: processedCharts,
        filters: {}
      });
    }
  };

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    
    // @ts-ignore
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setTimeout(() => handleQuery(undefined, transcript), 500);
    };

    recognition.start();
  };

  const onUploadComplete = (uploadedData: GenericData[]) => {
    setData(uploadedData as any);
    setShowUpload(false);
    // Automatically trigger a general analysis query for the new data
    handleQuery(undefined, "Analyze this dataset and show key trends", uploadedData);
  };

  if (view === 'landing') {
    return (
      <LandingPage 
        onStart={() => {
          setView('app');
          if (query.trim()) {
            handleQuery(undefined, query);
          }
        }} 
        onLoginClick={() => setShowLogin(true)} 
        user={user} 
        query={query}
        setQuery={setQuery}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white selection:bg-neon-blue/30">
      <ParticleBackground />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-20 hidden lg:flex flex-col items-center py-8 border-r border-white/5 z-50 glass-premium">
        <div className="w-12 h-12 bg-gradient-to-tr from-neon-blue to-electric-purple rounded-2xl flex items-center justify-center shadow-lg mb-12 cursor-pointer group" onClick={() => setView('landing')}>
          <Cpu className="text-white w-6 h-6 group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex-1 space-y-10">
          <div className="p-3 text-neon-blue bg-neon-blue/10 rounded-xl cursor-pointer"><LayoutDashboard className="w-6 h-6" /></div>
          <div onClick={() => setShowUpload(true)} className="p-3 text-slate-500 hover:text-neon-blue transition-colors cursor-pointer"><Upload className="w-6 h-6" /></div>
          <div className="p-3 text-slate-500 hover:text-neon-blue transition-colors cursor-pointer"><Database className="w-6 h-6" /></div>
          <div className="p-3 text-slate-500 hover:text-neon-blue transition-colors cursor-pointer"><Globe className="w-6 h-6" /></div>
        </div>
        <div className="space-y-6">
          <button onClick={() => setShowChat(!showChat)} className={`p-3 rounded-xl transition-colors ${showChat ? 'text-neon-blue bg-neon-blue/10' : 'text-slate-500 hover:text-neon-blue'}`}>
            <MessageSquare className="w-6 h-6" />
          </button>
          <div 
            onClick={() => setShowLogin(true)}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:border-neon-blue/50 transition-all overflow-hidden"
          >
            {user ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>
      </div>

      <main className={`lg:pl-20 min-h-screen transition-all duration-500 ${showChat ? 'lg:pr-[400px]' : ''}`}>
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-glow flex items-center gap-3">
                <Sparkles className="text-neon-blue w-6 h-6" /> InsightGenie <span className="text-[10px] bg-white/5 px-2 py-1 rounded border border-white/10 text-slate-500 font-black uppercase tracking-widest">Enterprise</span>
              </h1>
            </div>
            <div className="flex items-center gap-6">
              {Object.keys(activeFilters).length > 0 && (
                <button 
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-3 py-1.5 glass rounded-full text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <Filter className="w-3 h-3" /> Clear Filters
                </button>
              )}
              <div className="hidden md:flex items-center gap-3 px-4 py-2 glass rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-500">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> Real-time Sync Active
              </div>
              <button className="p-2 glass rounded-xl text-slate-400 hover:text-white transition-colors"><MoreVertical /></button>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500"
            >
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}

          {/* Floating AI Query Bar */}
          <div className="max-w-3xl mx-auto mb-16 sticky top-8 z-40">
            <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue to-electric-purple rounded-[28px] blur opacity-20"></div>
            <GlassCard className="p-2 relative border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <form onSubmit={(e) => handleQuery(e)} className="flex items-center gap-2">
                <div className="pl-4">
                  <div className="w-10 h-10 bg-gradient-to-tr from-neon-blue to-electric-purple rounded-full flex items-center justify-center shadow-lg">
                    <Cpu className="w-5 h-5 text-white" />
                  </div>
                </div>
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask Genie anything about your data..."
                  className="flex-1 bg-transparent border-none py-5 px-3 text-lg font-medium focus:outline-none placeholder:text-slate-500"
                />
                <div className="flex items-center gap-2 pr-2">
                  <button 
                    type="button"
                    onClick={startVoice}
                    className={`p-3 rounded-2xl transition-all ${isListening ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 'text-slate-500 hover:bg-white/5'}`}
                  >
                    {isListening ? <Waveform /> : <Mic className="w-6 h-6" />}
                  </button>
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="p-4 bg-white text-black rounded-2xl font-black hover:bg-neon-blue hover:text-white transition-all disabled:opacity-50"
                  >
                    {isLoading ? <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <ArrowRight className="w-6 h-6" />}
                  </button>
                </div>
              </form>
            </GlassCard>
            
            {/* Suggestions & History */}
            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { label: "Revenue Trend", icon: <TrendingUp className="w-3 h-3" /> },
                  { label: "Top Regions", icon: <Globe className="w-3 h-3" /> },
                  { label: "Category Share", icon: <PieChart className="w-3 h-3" /> },
                  { label: "Product Performance", icon: <Activity className="w-3 h-3" /> }
                ].map(s => (
                  <button 
                    key={s.label} 
                    onClick={() => { setQuery(s.label); handleQuery(undefined, s.label); }}
                    className="px-4 py-2 rounded-full glass text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-neon-blue hover:border-neon-blue/30 transition-all flex items-center gap-2"
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
              {queryHistory.length > 0 && (
                <div className="flex items-center gap-3 text-slate-600">
                  <History className="w-3 h-3" />
                  <div className="flex gap-2">
                    {queryHistory.map((h, i) => (
                      <button 
                        key={i} 
                        onClick={() => { setQuery(h); handleQuery(undefined, h); }}
                        className="text-[10px] font-bold hover:text-slate-400 transition-colors"
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-40"
                >
                  <div className="relative mb-10">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                      className="w-32 h-32 border-4 border-neon-blue/10 border-t-neon-blue rounded-full" 
                    />
                    <div className="absolute inset-0 m-auto w-16 h-16 bg-neon-blue/20 rounded-full blur-xl animate-pulse" />
                    <Cpu className="absolute inset-0 m-auto w-10 h-10 text-neon-blue animate-bounce" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter text-glow">Genie is thinking...</h3>
                  <div className="mt-4 flex gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Synthesizing Data</span>
                    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="text-xs font-bold text-neon-blue">_</motion.span>
                  </div>
                </motion.div>
              ) : dashboardConfig ? (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <Dashboard 
                    config={dashboardConfig} 
                    data={data} 
                    onDrillDown={handleDrillDown} 
                    onGenerateInsights={generateMoreInsights}
                    onToast={(msg, type) => setToast({ message: msg, type })}
                  />
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-40 text-center"
                >
                  <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center mb-8 border border-white/10 shadow-2xl">
                    <LayoutDashboard className="w-12 h-12 text-neon-blue" />
                  </div>
                  <h3 className="text-4xl font-black tracking-tighter mb-4 text-glow">Ready for Insights?</h3>
                  <p className="text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
                    Connect your data sources and ask Genie to visualize your business performance instantly.
                  </p>
                  <div className="mt-10 grid grid-cols-2 gap-4 max-w-lg">
                    <div className="p-6 glass rounded-2xl text-left border-white/5">
                      <div className="w-8 h-8 bg-neon-blue/20 rounded-lg flex items-center justify-center mb-4"><Database className="w-4 h-4 text-neon-blue" /></div>
                      <h4 className="font-bold text-sm mb-1">Connect Data</h4>
                      <p className="text-[10px] text-slate-500 font-medium">PostgreSQL, Snowflake, BigQuery</p>
                    </div>
                    <div className="p-6 glass rounded-2xl text-left border-white/5">
                      <div className="w-8 h-8 bg-electric-purple/20 rounded-lg flex items-center justify-center mb-4"><Zap className="w-4 h-4 text-electric-purple" /></div>
                      <h4 className="font-bold text-sm mb-1">Auto-Sync</h4>
                      <p className="text-[10px] text-slate-500 font-medium">Real-time updates every 60s</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Right Chat Sidebar */}
      <AnimatePresence>
        {showChat && (
          <motion.div 
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-[400px] hidden lg:block z-50 p-4"
          >
            <ChatPanel data={data} currentConfig={dashboardConfig} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <DataUpload 
            onUploadComplete={onUploadComplete} 
            onClose={() => setShowUpload(false)} 
          />
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <LoginModal 
            currentUser={user}
            onLogin={(u) => { setUser(u); setShowLogin(false); }} 
            onLogout={() => { setUser(null); setShowLogin(false); }}
            onClose={() => setShowLogin(false)} 
          />
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-bold text-sm">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
