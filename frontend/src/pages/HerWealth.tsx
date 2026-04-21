import PageTransition from "@/components/PageTransition";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid 
} from "recharts";
import { Sparkles, TrendingUp, ShieldCheck, Gem, Info, Flower2, PieChart as PieChartIcon } from "lucide-react";

// SAFE Allocation Data
const allocationData = [
  { name: "Stocks", value: 30, color: "#FB7185" }, // rose-400
  { name: "Long-term Bonds", value: 30, color: "#818CF8" }, // indigo-400
  { name: "Gold", value: 20, color: "#FBBF24" }, // amber-400
  { name: "ETFs", value: 20, color: "#34D399" }, // emerald-400
];

// Trajectory Growth Data ($12,450.89 at 9% annual growth)
const trajectoryData = [
  { year: "Initial", value: 12450.89 },
  { year: "10 Years", value: 29475.00 },
  { year: "20 Years", value: 69774.00 },
  { year: "30 Years", value: 165185.00 },
];

const HerWealth = () => {
  return (
    <PageTransition>
      <div className="pt-8 pb-20 max-w-6xl mx-auto space-y-12">
        
        {/* Page Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-20 w-20 rounded-[2rem] bg-gradient-to-br from-rose-50 to-rose-100 flex items-center justify-center border border-rose-100 shadow-2xl shadow-rose-500/10 mb-2 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 backdrop-blur-sm group-hover:opacity-0 transition-opacity" />
            <Flower2 size={36} className="text-rose-500 relative z-10" />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">HerWealth Signature</h1>
            <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em]">Curated Financial Empowerment</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4">
          
          {/* SAFE Allocation Chart */}
          <div className="bg-white/70 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-rose-100/50 shadow-2xl shadow-rose-500/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck size={120} className="text-rose-500" />
            </div>
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3 text-rose-500">
                <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100 shadow-inner">
                  <PieChartIcon size={18} className="stroke-[2.5]" />
                </div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">SAFE Allocation</h3>
                <div className="ml-auto px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none">Optimal Stability</p>
                </div>
              </div>
              
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: "white", border: "1px solid rgba(251,113,133,0.1)", borderRadius: 16, boxShadow: "0 10px 30px rgba(244,63,94,0.08)" }}
                      itemStyle={{ fontSize: "15px", fontWeight: 700, color: "#334155" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {allocationData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50/50 border border-slate-100">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.name}</span>
                    <span className="ml-auto text-[10px] font-black text-slate-800">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Portfolio Trajectory Chart */}
          <div className="bg-white/70 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-rose-100/50 shadow-2xl shadow-rose-500/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp size={120} className="text-indigo-500" />
            </div>

            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3 text-indigo-500">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-inner">
                  <TrendingUp size={18} className="stroke-[2.5]" />
                </div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Portfolio Trajectory</h3>
                <div className="ml-auto text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Starting Capital</p>
                  <p className="text-sm font-black text-slate-800">$12,450.89</p>
                </div>
              </div>

              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trajectoryData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(251,113,133,0.05)" />
                    <XAxis 
                      dataKey="year" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: "#94A3B8" }} 
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip 
                       contentStyle={{ background: "white", border: "1px solid rgba(251,113,133,0.1)", borderRadius: 16, boxShadow: "0 10px 30px rgba(244,63,94,0.08)" }}
                       formatter={(val: number) => [`$${val.toLocaleString()}`, "Projected Wealth"]}
                       labelStyle={{ display: "none" }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#818CF8" 
                      strokeWidth={4} 
                      dot={{ r: 6, fill: "#818CF8", strokeWidth: 2, stroke: "white" }}
                      activeDot={{ r: 8, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-between items-center p-6 rounded-3xl bg-slate-900 shadow-xl border border-slate-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-rose-500/10" />
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">30-Year Projection</p>
                  <p className="text-2xl font-black text-white">$165,185.00</p>
                </div>
                <div className="relative z-10 text-right">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-2">
                    <TrendingUp size={12} className="text-emerald-400" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase">~13.2x Growth</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Verdict Section */}
        <div className="px-4">
          <div className="bg-white/80 backdrop-blur-3xl rounded-[3rem] p-12 border border-rose-100 shadow-2xl shadow-rose-500/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-400 via-indigo-400 to-rose-400" />
            
            <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
              <div className="md:w-1/3 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 border border-rose-100">
                  <Sparkles size={16} className="text-rose-500" />
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">AI Intelligence</span>
                </div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter leading-tight">Your Financial Path to Freedom</h2>
                <div className="flex items-center gap-4">
                  <div className="h-0.5 w-12 bg-rose-200" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Personalized Strategy</p>
                </div>
              </div>

              <div className="md:w-2/3">
                <div className="bg-rose-50/30 rounded-[2rem] p-8 border border-white relative">
                  <div className="absolute -top-4 -left-4">
                    <Info size={32} className="text-rose-100" />
                  </div>
                  <p className="text-lg text-slate-700 font-medium leading-relaxed italic">
                    "Financial independence isn't about working harder; it's about making your capital work for you with grace and precision. By diversifying across high-growth stocks and stability-anchored gold, you're building a resilient vault that protects your future while capturing market opportunities. Aim for consistent monthly contributions alongside your initial $12k—even small, automated steps today can secure a life of choice and legacy for the decades to come. Trust the compounding, stay the course, and let your wealth bloom."
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-10 mt-10 ml-2">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Strategy Index</p>
                    <p className="text-sm font-black text-slate-800 tracking-tight">Compound Stability Protocol</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Confidence Score</p>
                    <p className="text-sm font-black text-rose-500 tracking-tight">98.4% Probability</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </PageTransition>
  );
};

export default HerWealth;
