import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Terminal, 
  FileText, 
  GitBranch, 
  ShieldCheck, 
  Plus,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  History,
  ArrowRight,
  Globe,
  Zap,
  Lock,
  ChevronRight,
  Play,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Report = {
  artifact_id: string;
  lineage: Array<{
    run_metadata: {
      run_id: string;
      description: string;
      created_at: string;
      code_version: string;
    };
    upstream_inputs: string[];
  }>;
  scraping_signals: Array<{
    dataset_id: string;
    domain: string;
    fetched_at: string;
    has_robots_txt: boolean;
    has_llms_txt: boolean;
    robots_txt_preview: string;
    llms_txt_preview: string;
  }>;
};

const DEMO_REPORT: Report = {
  artifact_id: "demo_model_v1",
  lineage: [
    {
      run_metadata: {
        run_id: "train_run_001",
        description: "Fine-tuning on cleaned social media dataset",
        created_at: new Date().toISOString(),
        code_version: "v2.1.0-alpha"
      },
      upstream_inputs: ["cleaned_social_data", "base_weights_v4"]
    },
    {
      run_metadata: {
        run_id: "clean_job_42",
        description: "PII removal and robots.txt filtering",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        code_version: "v1.9.5"
      },
      upstream_inputs: ["raw_scraped_data"]
    }
  ],
  scraping_signals: [
    {
      dataset_id: "raw_scraped_data",
      domain: "example-news.com",
      fetched_at: new Date(Date.now() - 172800000).toISOString(),
      has_robots_txt: true,
      has_llms_txt: true,
      robots_txt_preview: "User-agent: *\nDisallow: /private/\nAllow: /public/",
      llms_txt_preview: "User-agent: AI-Bot\nAllow: /articles/"
    }
  ]
};

export default function App() {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState<'report' | 'docs' | 'snapshot' | 'run' | 'example'>('report');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Form States
  const [snapshotForm, setSnapshotForm] = useState({ datasetId: '', url: '' });
  const [runForm, setRunForm] = useState({ 
    runId: '', 
    description: '', 
    codeVersion: '', 
    inputs: '', 
    outputs: '', 
    modelIds: '' 
  });
  const [reportId, setReportId] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [stats, setStats] = useState({ total_runs: 0, total_snapshots: 0, total_domains: 0, compliance_score: 0 });
  const [runs, setRuns] = useState<any[]>([]);

  useEffect(() => {
    if (view === 'app') {
      fetchStats();
      fetchRuns();
    }
  }, [view, activeTab]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (e) {
      console.error("Failed to fetch stats", e);
    }
  };

  const fetchRuns = async () => {
    try {
      const res = await fetch('/api/runs');
      const data = await res.json();
      if (res.ok) setRuns(data);
    } catch (e) {
      console.error("Failed to fetch runs", e);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleInitDb = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/init-db', { method: 'POST' });
      const data = await res.json();
      if (res.ok) showMessage('success', 'Database initialized successfully');
      else showMessage('error', data.error);
    } catch (e: any) {
      showMessage('error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snapshotForm)
      });
      const data = await res.json();
      if (res.ok) {
        showMessage('success', `Snapshot recorded for ${snapshotForm.datasetId}`);
        setSnapshotForm({ datasetId: '', url: '' });
      } else showMessage('error', data.error);
    } catch (e: any) {
      showMessage('error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...runForm,
        inputs: runForm.inputs.split(',').map(s => s.trim()).filter(Boolean),
        outputs: runForm.outputs.split(',').map(s => s.trim()).filter(Boolean),
        modelIds: runForm.modelIds.split(',').map(s => s.trim()).filter(Boolean),
      };
      const res = await fetch('/api/create-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        showMessage('success', `Run ${runForm.runId} recorded successfully`);
        setRunForm({ runId: '', description: '', codeVersion: '', inputs: '', outputs: '', modelIds: '' });
      } else showMessage('error', data.error);
    } catch (e: any) {
      showMessage('error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setReport(null);
    try {
      const res = await fetch(`/api/report/${reportId}`);
      const data = await res.json();
      if (res.ok) {
        setReport(data);
      } else showMessage('error', data.error);
    } catch (e: any) {
      showMessage('error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDemo = () => {
    setReport(DEMO_REPORT);
    setActiveTab('report');
    setView('app');
  };

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-white selection:bg-zinc-900 selection:text-white">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
                <ShieldCheck size={20} />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">Provenance</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">How it Works</a>
              <button 
                onClick={() => setView('app')}
                className="px-5 py-2.5 bg-zinc-900 text-white rounded-full text-sm font-semibold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200"
              >
                Launch App
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-40 pb-24 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 text-zinc-600 text-xs font-bold uppercase tracking-widest mb-8">
                <Zap size={14} className="text-zinc-900" />
                The Future of AI Data Integrity
              </span>
              <h1 className="font-display text-6xl md:text-8xl font-bold tracking-tight text-zinc-900 mb-8 leading-[0.9]">
                Automated Provenance <br />
                <span className="text-zinc-400">for AI Pipelines.</span>
              </h1>
              <p className="max-w-2xl mx-auto text-xl text-zinc-500 mb-12 leading-relaxed">
                The "Install & Forget" protocol for verifiable AI data. Automatically track lineage, capture scraping signals, and build audit-ready models.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => setView('app')}
                  className="w-full sm:w-auto px-8 py-4 bg-zinc-900 text-white rounded-full font-bold text-lg hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 flex items-center justify-center gap-2 group"
                >
                  Explore Dashboard
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={loadDemo}
                  className="w-full sm:w-auto px-8 py-4 bg-white text-zinc-900 border border-zinc-200 rounded-full font-bold text-lg hover:bg-zinc-50 transition-all flex items-center justify-center gap-2"
                >
                  <Play size={18} fill="currentColor" />
                  Try Live Demo
                </button>
                <button 
                  onClick={() => { setView('app'); setActiveTab('docs'); }}
                  className="w-full sm:w-auto px-8 py-4 bg-zinc-50 text-zinc-500 rounded-full font-bold text-lg hover:bg-zinc-100 transition-all flex items-center justify-center gap-2"
                >
                  <Terminal size={18} />
                  SDK Docs
                </button>
              </div>
            </motion.div>

            {/* Visual Teaser */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mt-24 relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-b from-zinc-100 to-transparent rounded-[40px] -z-10" />
              <div className="bg-white rounded-[32px] border border-zinc-200 shadow-2xl overflow-hidden p-4">
                <div className="bg-zinc-50 rounded-2xl border border-zinc-100 p-8 text-left">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center text-white">
                      <GitBranch size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Provenance Graph</h3>
                      <p className="text-sm text-zinc-400">Tracing model_v2.1 back to source</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-12 w-full bg-white rounded-xl border border-zinc-200 flex items-center px-4 gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-sm font-medium">social_media_cleaned_v1</span>
                    </div>
                    <div className="flex justify-center py-2">
                      <ArrowRight size={20} className="rotate-90 text-zinc-300" />
                    </div>
                    <div className="h-12 w-full bg-white rounded-xl border border-zinc-200 flex items-center px-4 gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-sm font-medium">raw_scraped_dataset_42</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-zinc-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-zinc-900 border border-zinc-100">
                  <Globe size={24} />
                </div>
                <h3 className="font-display font-bold text-xl">Scraping Signals</h3>
                <p className="text-zinc-500 leading-relaxed">Automatically capture robots.txt and llms.txt snapshots at the moment of scraping for compliance proof.</p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-zinc-900 border border-zinc-100">
                  <GitBranch size={24} />
                </div>
                <h3 className="font-display font-bold text-xl">Lineage Tracking</h3>
                <p className="text-zinc-500 leading-relaxed">Map every transformation from raw data to final model weights with immutable run logs.</p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-zinc-900 border border-zinc-100">
                  <Lock size={24} />
                </div>
                <h3 className="font-display font-bold text-xl">Trust & Compliance</h3>
                <p className="text-zinc-500 leading-relaxed">Generate verifiable reports to prove data usage rights and maintain high-quality AI standards.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-20 border-t border-zinc-100">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-zinc-900 rounded flex items-center justify-center text-white">
                <ShieldCheck size={14} />
              </div>
              <span className="font-display font-bold tracking-tight">Provenance</span>
            </div>
            <p className="text-sm text-zinc-400">© 2024 AI Data Provenance Tool. Built for verifiable data integrity.</p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-zinc-400 hover:text-zinc-900 transition-colors">Twitter</a>
              <a href="#" className="text-sm text-zinc-400 hover:text-zinc-900 transition-colors">GitHub</a>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      {/* App Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-zinc-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('landing')}>
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white shadow-lg shadow-zinc-200">
              <ShieldCheck size={18} />
            </div>
            <h1 className="font-display font-bold text-lg tracking-tight">Provenance</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleInitDb}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-all flex items-center gap-2"
            >
              <Database size={14} />
              Init DB
            </button>
            <div className="w-px h-6 bg-zinc-100" />
            <nav className="flex bg-zinc-100 p-1 rounded-xl">
              {(['report', 'example', 'docs', 'snapshot', 'run'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                    activeTab === tab 
                      ? 'bg-white text-zinc-900 shadow-sm' 
                      : 'text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  {tab === 'report' ? 'Explorer' : tab === 'docs' ? 'SDK' : tab === 'example' ? 'Case Study' : tab}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Notifications */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`mb-8 p-4 rounded-2xl flex items-center gap-3 border ${
                message.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                  : 'bg-red-50 border-red-100 text-red-800'
              }`}
            >
              {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <p className="text-sm font-medium">{message.text}</p>
            </motion.div>
          )}
        </AnimatePresence>
 
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Runs', value: stats.total_runs, icon: <GitBranch size={16} />, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Snapshots', value: stats.total_snapshots, icon: <Globe size={16} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Domains', value: stats.total_domains, icon: <Database size={16} />, color: 'text-violet-600', bg: 'bg-violet-50' },
            { label: 'Compliance', value: `${stats.compliance_score}%`, icon: <ShieldCheck size={16} />, color: 'text-zinc-900', bg: 'bg-zinc-100' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                  {stat.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{stat.label}</span>
              </div>
              <p className="text-2xl font-display font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar / Steps */}
          <div className="lg:col-span-4 space-y-8">
              <div className="space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Navigation</h2>
                <div className="space-y-2">
                  {[
                    { id: 'report', label: 'Audit Explorer', desc: 'Trace automated lineage' },
                    { id: 'example', label: 'Product Example', desc: 'See a real audit trail' },
                    { id: 'docs', label: 'SDK Integration', desc: 'Install background tracker' },
                    { id: 'snapshot', label: 'Manual Signal', desc: 'Test signal capture' },
                    { id: 'run', label: 'Manual Run', desc: 'Test transformation log' }
                  ].map((step) => (
                    <button
                      key={step.id}
                      onClick={() => setActiveTab(step.id as any)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${
                        activeTab === step.id 
                          ? 'bg-white border-zinc-900 shadow-xl shadow-zinc-100' 
                          : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-50'
                      }`}
                    >
                      <p className={`text-sm font-bold mb-1 ${activeTab === step.id ? 'text-zinc-900' : ''}`}>{step.label}</p>
                      <p className="text-xs font-medium opacity-60">{step.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

            <div className="p-6 bg-zinc-900 rounded-3xl text-white">
              <h3 className="font-bold mb-2 flex items-center gap-2 text-sm">
                <Terminal size={14} className="text-emerald-400" />
                Background Tracking
              </h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                This dashboard displays data captured automatically by the <code className="text-emerald-400">provenance-sdk</code>. Manual entries are for debugging only.
              </p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {activeTab === 'example' && (
                <motion.div
                  key="example"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="bg-white rounded-[32px] border border-zinc-200 shadow-sm p-10">
                    <div className="mb-10">
                      <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-900 mb-6 border border-zinc-100">
                        <FileText size={24} />
                      </div>
                      <h2 className="text-3xl font-display font-bold mb-3">Product Example: WebText-v2</h2>
                      <p className="text-zinc-500">A concrete look at how Provenance solves real-world AI data challenges.</p>
                    </div>

                    <div className="space-y-12">
                      <section className="space-y-8">
                        <div className="text-center max-w-2xl mx-auto mb-12">
                          <h3 className="text-2xl font-display font-bold mb-4">The Transformation: From Data Fog to Audit Clarity</h3>
                          <p className="text-zinc-500 text-sm">How Provenance turns a liability into a strategic asset.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Before Column */}
                          <div className="space-y-6">
                            <div className="flex items-center gap-3 text-red-500 font-bold uppercase tracking-widest text-xs">
                              <AlertCircle size={16} />
                              Before: The Data Fog
                            </div>
                            <div className="space-y-4">
                              <div className="p-6 bg-red-50/30 border border-red-100 rounded-2xl space-y-3">
                                <h4 className="font-bold text-zinc-900">Forensic Debt</h4>
                                <p className="text-sm text-zinc-600 leading-relaxed">
                                  When a model exhibits bias or a copyright claim arrives, engineers spend weeks manually reconstructing data history from fragmented logs and old git commits.
                                </p>
                              </div>
                              <div className="p-6 bg-red-50/30 border border-red-100 rounded-2xl space-y-3">
                                <h4 className="font-bold text-zinc-900">Compliance Hallucinations</h4>
                                <p className="text-sm text-zinc-600 leading-relaxed">
                                  Teams "assume" they followed <code className="bg-red-100/50 px-1 rounded text-red-700">robots.txt</code>, but have no timestamped proof of what the permissions were at the exact millisecond of the scrape.
                                </p>
                              </div>
                              <div className="p-6 bg-red-50/30 border border-red-100 rounded-2xl space-y-3">
                                <h4 className="font-bold text-zinc-900">The Lineage Gap</h4>
                                <p className="text-sm text-zinc-600 leading-relaxed">
                                  There is no verifiable link between the raw data on a server and the final weights in a model. The "Chain of Custody" is broken, making audits impossible.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* After Column */}
                          <div className="space-y-6">
                            <div className="flex items-center gap-3 text-emerald-500 font-bold uppercase tracking-widest text-xs">
                              <CheckCircle2 size={16} />
                              After: The Automated Auditor
                            </div>
                            <div className="space-y-4">
                              <div className="p-6 bg-emerald-50/30 border border-emerald-100 rounded-2xl space-y-3">
                                <h4 className="font-bold text-zinc-900">Instant Traceability</h4>
                                <p className="text-sm text-zinc-600 leading-relaxed">
                                  Every data point is automatically tagged with its origin, scraper version, and code commit. Forensic reconstruction takes seconds, not weeks.
                                </p>
                              </div>
                              <div className="p-6 bg-emerald-50/30 border border-emerald-100 rounded-2xl space-y-3">
                                <h4 className="font-bold text-zinc-900">Immutable Evidence</h4>
                                <p className="text-sm text-zinc-600 leading-relaxed">
                                  Every scrape captures a cryptographic snapshot of <code className="bg-emerald-100/50 px-1 rounded text-emerald-700">llms.txt</code> and <code className="bg-emerald-100/50 px-1 rounded text-emerald-700">robots.txt</code>, creating a permanent legal record of compliance.
                                </p>
                              </div>
                              <div className="p-6 bg-emerald-50/30 border border-emerald-100 rounded-2xl space-y-3">
                                <h4 className="font-bold text-zinc-900">End-to-End Lineage</h4>
                                <p className="text-sm text-zinc-600 leading-relaxed">
                                  A complete, searchable "Chain of Custody" from raw scrape to model deployment. Every transformation is recorded, verified, and ready for any auditor.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className="space-y-8">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold flex items-center gap-2">
                            <CheckCircle2 size={20} className="text-emerald-500" />
                            Audit Report: WebText-v2
                          </h3>
                          <div className="flex gap-2">
                            <span className="px-3 py-1 bg-zinc-100 text-zinc-500 text-[10px] font-bold uppercase tracking-widest rounded-full">Internal Document</span>
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest rounded-full">Verified</span>
                          </div>
                        </div>
                        
                        <div className="bg-zinc-50 border border-zinc-200 rounded-3xl overflow-hidden">
                          <div className="p-8 border-b border-zinc-200 bg-white">
                            <div className="grid grid-cols-2 gap-8">
                              <div>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Artifact Name</p>
                                <p className="font-display font-bold text-lg">WebText-v2-Final</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Verification Hash</p>
                                <p className="font-mono text-xs text-zinc-500">sha256:8f2d1a...3e9b2c</p>
                              </div>
                            </div>
                          </div>

                          <div className="p-8 space-y-8">
                            {/* Signals Section */}
                            <div className="space-y-4">
                              <h4 className="text-sm font-bold text-zinc-900 border-l-2 border-zinc-900 pl-3">1. Scraping Signals (4 Domains)</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                  { domain: 'tech-journal.com', status: 'Allowed', signal: 'robots.txt' },
                                  { domain: 'science-daily.org', status: 'Allowed', signal: 'llms.txt' },
                                  { domain: 'open-archive.io', status: 'Restricted', signal: 'robots.txt' },
                                  { domain: 'global-news-wire.net', status: 'Allowed', signal: 'robots.txt' }
                                ].map((d, i) => (
                                  <div key={i} className="p-4 bg-white border border-zinc-100 rounded-2xl flex items-center justify-between">
                                    <div>
                                      <p className="font-bold text-sm">{d.domain}</p>
                                      <p className="text-[10px] text-zinc-400">Captured via {d.signal}</p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${d.status === 'Allowed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                      {d.status}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              
                              <div className="mt-4">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Raw Signal Snapshot (tech-journal.com)</p>
                                <div className="bg-zinc-900 rounded-2xl p-6 font-mono text-[11px] text-zinc-300">
                                  <p className="text-zinc-500 mb-2"># Captured at 2024-03-05 10:00:00Z</p>
                                  <p className="text-emerald-400">User-agent: *</p>
                                  <p className="text-red-400">Disallow: /admin/</p>
                                  <p className="text-emerald-400">Allow: /</p>
                                  <p className="mt-4 text-emerald-400">User-agent: GPTBot</p>
                                  <p className="text-emerald-400">Allow: /public/articles/</p>
                                </div>
                              </div>
                            </div>

                            {/* Lineage Section */}
                            <div className="space-y-4">
                              <h4 className="text-sm font-bold text-zinc-900 border-l-2 border-zinc-900 pl-3">2. Lineage Audit Log</h4>
                              <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden">
                                <table className="w-full text-left text-xs">
                                  <thead className="bg-zinc-50 border-b border-zinc-100">
                                    <tr>
                                      <th className="p-4 font-bold text-zinc-400 uppercase tracking-widest">Step</th>
                                      <th className="p-4 font-bold text-zinc-400 uppercase tracking-widest">Action</th>
                                      <th className="p-4 font-bold text-zinc-400 uppercase tracking-widest">Code Version</th>
                                      <th className="p-4 font-bold text-zinc-400 uppercase tracking-widest">Output</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-zinc-50">
                                    <tr>
                                      <td className="p-4 font-bold">01</td>
                                      <td className="p-4 text-zinc-600">Raw Scrape (4 domains)</td>
                                      <td className="p-4 font-mono text-zinc-400">scraper-v2.4</td>
                                      <td className="p-4"><span className="px-2 py-0.5 bg-zinc-100 rounded">webtext_raw</span></td>
                                    </tr>
                                    <tr>
                                      <td className="p-4 font-bold">02</td>
                                      <td className="p-4 text-zinc-600">PII & Robots Filtering</td>
                                      <td className="p-4 font-mono text-zinc-400">cleaner-v1.9</td>
                                      <td className="p-4"><span className="px-2 py-0.5 bg-zinc-100 rounded">webtext_clean</span></td>
                                    </tr>
                                    <tr>
                                      <td className="p-4 font-bold">03</td>
                                      <td className="p-4 text-zinc-600">Model Fine-tuning</td>
                                      <td className="p-4 font-mono text-zinc-400">trainer-v3.0</td>
                                      <td className="p-4"><span className="px-2 py-0.5 bg-zinc-900 text-white rounded">webtext_v2_final</span></td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'docs' && (
                <motion.div
                  key="docs"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-[32px] border border-zinc-200 shadow-sm p-10"
                >
                  <div className="mb-10">
                    <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-900 mb-6 border border-zinc-100">
                      <Terminal size={24} />
                    </div>
                    <h2 className="text-3xl font-display font-bold mb-3">SDK Integration</h2>
                    <p className="text-zinc-500">Integrate the provenance tracker into your existing Python pipelines with just a few lines of code.</p>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <ArrowRight size={18} className="text-zinc-400" />
                        1. Install the SDK
                      </h3>
                      <div className="bg-zinc-900 rounded-2xl p-6 font-mono text-sm text-zinc-300">
                        <span className="text-zinc-500">$</span> pip install provenance-sdk
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <ArrowRight size={18} className="text-zinc-400" />
                        2. Automated Scraping Signals
                      </h3>
                      <p className="text-sm text-zinc-500">The SDK automatically captures robots.txt and llms.txt when you fetch data.</p>
                      <div className="bg-zinc-900 rounded-2xl p-6 font-mono text-sm text-zinc-300">
                        <p className="text-emerald-500">from</p> provenance <p className="text-emerald-500">import</p> tracker<br /><br />
                        <p className="text-zinc-500"># Automatically snapshots signals on request</p><br />
                        data = tracker.fetch(<p className="text-orange-400">"https://example.com/data"</p>)
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <ArrowRight size={18} className="text-zinc-400" />
                        3. Automated Lineage
                      </h3>
                      <p className="text-sm text-zinc-500">Use decorators to track transformations without manual logging.</p>
                      <div className="bg-zinc-900 rounded-2xl p-6 font-mono text-sm text-zinc-300">
                        <p className="text-emerald-500">@tracker.run</p>(inputs=[<p className="text-orange-400">"raw_data"</p>], outputs=[<p className="text-orange-400">"clean_data"</p>])<br />
                        <p className="text-emerald-500">def</p> <p className="text-blue-400">clean_dataset</p>():<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<p className="text-zinc-500"># Transformation logic here</p><br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<p className="text-emerald-500">pass</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'snapshot' && (
                <motion.div
                  key="snapshot"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-[32px] border border-zinc-200 shadow-sm p-10"
                >
                  <div className="mb-10">
                    <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-900 mb-6 border border-zinc-100">
                      <Globe size={24} />
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-3xl font-display font-bold">Manual Signal Capture</h2>
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-widest rounded-md">Debug Mode</span>
                    </div>
                    <p className="text-zinc-500">Manually trigger a signal snapshot for testing purposes. In production, this is handled by the SDK.</p>
                  </div>
                  
                  <form onSubmit={handleSnapshot} className="space-y-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Dataset Identifier</label>
                        <input 
                          required
                          placeholder="e.g. raw_scraped_v1"
                          className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium"
                          value={snapshotForm.datasetId}
                          onChange={e => setSnapshotForm({ ...snapshotForm, datasetId: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Target Domain URL</label>
                        <input 
                          required
                          type="url"
                          placeholder="https://example.com"
                          className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium"
                          value={snapshotForm.url}
                          onChange={e => setSnapshotForm({ ...snapshotForm, url: e.target.value })}
                        />
                      </div>
                    </div>
                    <button 
                      disabled={loading}
                      className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-zinc-200"
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                      Record Snapshot
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === 'run' && (
                <motion.div
                  key="run"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-[32px] border border-zinc-200 shadow-sm p-10"
                >
                  <div className="mb-10">
                    <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-900 mb-6 border border-zinc-100">
                      <GitBranch size={24} />
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-3xl font-display font-bold">Manual Run Log</h2>
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-widest rounded-md">Debug Mode</span>
                    </div>
                    <p className="text-zinc-500">Manually record a transformation run. In production, use the <code className="bg-zinc-100 px-1 rounded text-zinc-900">@tracker.run</code> decorator.</p>
                  </div>
                  
                  <form onSubmit={handleCreateRun} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Run ID</label>
                        <input 
                          required
                          placeholder="e.g. cleaning_job_001"
                          className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium"
                          value={runForm.runId}
                          onChange={e => setRunForm({ ...runForm, runId: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Code Version</label>
                        <input 
                          placeholder="e.g. git hash or v1.0"
                          className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium"
                          value={runForm.codeVersion}
                          onChange={e => setRunForm({ ...runForm, codeVersion: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Description</label>
                      <input 
                        required
                        placeholder="What happened in this run?"
                        className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium"
                        value={runForm.description}
                        onChange={e => setRunForm({ ...runForm, description: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Inputs</label>
                        <input 
                          placeholder="ds1, ds2"
                          className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all text-sm"
                          value={runForm.inputs}
                          onChange={e => setRunForm({ ...runForm, inputs: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Outputs</label>
                        <input 
                          placeholder="clean_ds1"
                          className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all text-sm"
                          value={runForm.outputs}
                          onChange={e => setRunForm({ ...runForm, outputs: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Models</label>
                        <input 
                          placeholder="model_v1"
                          className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all text-sm"
                          value={runForm.modelIds}
                          onChange={e => setRunForm({ ...runForm, modelIds: e.target.value })}
                        />
                      </div>
                    </div>
                    <button 
                      disabled={loading}
                      className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-zinc-200"
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : <GitBranch size={20} />}
                      Record Run
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === 'report' && (
                <motion.div
                  key="report"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="bg-white rounded-[32px] border border-zinc-200 shadow-sm p-10">
                    <div className="mb-10">
                      <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-900 mb-6 border border-zinc-100">
                        <Search size={24} />
                      </div>
                      <h2 className="text-3xl font-display font-bold mb-3">Provenance Explorer</h2>
                      <p className="text-zinc-500">Trace the lineage and scraping signals for any artifact. Enter an ID to see its full history.</p>
                    </div>
                    
                    <form onSubmit={handleGetReport} className="flex gap-4">
                      <input 
                        required
                        placeholder="Enter Artifact ID (e.g. model_v1)"
                        className="flex-1 px-5 py-4 rounded-2xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium"
                        value={reportId}
                        onChange={e => setReportId(e.target.value)}
                      />
                      <button 
                        disabled={loading}
                        className="px-8 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-zinc-200"
                      >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                        Trace
                      </button>
                    </form>
                  </div>

                  {!report && runs.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white rounded-[32px] border border-zinc-200 shadow-sm overflow-hidden"
                    >
                      <div className="p-8 border-b border-zinc-100 bg-zinc-50/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <History size={20} className="text-zinc-900" />
                          <h3 className="font-display font-bold text-xl">Recent Activity</h3>
                        </div>
                      </div>
                      <div className="divide-y divide-zinc-100">
                        {runs.map((run, i) => (
                          <div key={i} className="p-6 hover:bg-zinc-50 transition-colors cursor-pointer" onClick={() => { setReportId(run.run_id); handleGetReport({ preventDefault: () => {} } as any); }}>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-lg">{run.run_id}</h4>
                              <span className="text-[10px] font-mono bg-zinc-100 px-2 py-1 rounded text-zinc-500">{new Date(run.created_at).toLocaleString()}</span>
                            </div>
                            <p className="text-sm text-zinc-500">{run.description}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {report && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-8"
                    >
                      {/* Lineage Section */}
                      <div className="bg-white rounded-[32px] border border-zinc-200 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-zinc-100 bg-zinc-50/30 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <History size={20} className="text-zinc-900" />
                            <h3 className="font-display font-bold text-xl">Lineage Graph</h3>
                          </div>
                          <span className="px-3 py-1 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                            {report.artifact_id}
                          </span>
                        </div>
                        <div className="p-8 space-y-10">
                          {report.lineage.length === 0 ? (
                            <p className="text-zinc-400 text-sm italic">No upstream lineage found for this artifact.</p>
                          ) : (
                            report.lineage.map((run, i) => (
                              <div key={i} className="flex gap-8 relative">
                                {i < report.lineage.length - 1 && (
                                  <div className="absolute left-6 top-12 bottom-0 w-px bg-zinc-100" />
                                )}
                                <div className="flex flex-col items-center shrink-0">
                                  <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-900 flex items-center justify-center shadow-sm z-10">
                                    <GitBranch size={20} />
                                  </div>
                                </div>
                                <div className="flex-1 pb-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-bold text-xl tracking-tight">{run.run_metadata.run_id}</h4>
                                    <span className="text-[10px] font-mono bg-zinc-100 px-3 py-1.5 rounded-lg text-zinc-500 font-bold uppercase">
                                      {run.run_metadata.code_version}
                                    </span>
                                  </div>
                                  <p className="text-zinc-500 text-sm mb-6 leading-relaxed">{run.run_metadata.description}</p>
                                  <div className="flex flex-wrap gap-3">
                                    {run.upstream_inputs.map(input => (
                                      <div key={input} className="flex items-center gap-2 px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-xs font-bold text-zinc-600">
                                        <Database size={14} />
                                        {input}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Scraping Signals Section */}
                      <div className="bg-white rounded-[32px] border border-zinc-200 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-zinc-100 bg-zinc-50/30 flex items-center gap-3">
                          <ShieldCheck size={20} className="text-zinc-900" />
                          <h3 className="font-display font-bold text-xl">Scraping Signals</h3>
                        </div>
                        <div className="divide-y divide-zinc-100">
                          {report.scraping_signals.length === 0 ? (
                            <div className="p-10 text-zinc-400 text-sm italic text-center">No scraping signals found in the upstream lineage.</div>
                          ) : (
                            report.scraping_signals.map((signal, i) => (
                              <div key={i} className="p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                                      <Globe size={20} />
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-base">{signal.domain}</h4>
                                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Dataset: {signal.dataset_id}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Captured</p>
                                    <p className="text-xs font-mono text-zinc-600 font-medium">{new Date(signal.fetched_at).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-6">
                                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${signal.has_robots_txt ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' : 'bg-red-50/50 border-red-100 text-red-700'}`}>
                                    <span className="text-xs font-bold uppercase tracking-widest">robots.txt</span>
                                    {signal.has_robots_txt ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                  </div>
                                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${signal.has_llms_txt ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' : 'bg-red-50/50 border-red-100 text-red-700'}`}>
                                    <span className="text-xs font-bold uppercase tracking-widest">llms.txt</span>
                                    {signal.has_llms_txt ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                  </div>
                                </div>

                                {(signal.robots_txt_preview || signal.llms_txt_preview) && (
                                  <div className="p-6 bg-zinc-900 rounded-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 opacity-20">
                                      <FileText size={40} className="text-white" />
                                    </div>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Snapshot Preview</p>
                                    <pre className="text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                                      {signal.robots_txt_preview || signal.llms_txt_preview}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-20 border-t border-zinc-100 text-center">
        <p className="text-zinc-400 text-xs font-bold uppercase tracking-[0.2em]">
          Verifiable Data Integrity Protocol
        </p>
      </footer>
    </div>
  );
}
