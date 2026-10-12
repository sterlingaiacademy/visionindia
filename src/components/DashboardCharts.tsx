"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ['#0F5A2A', '#E67E22', '#10b981', '#0ea5e9', '#8b5cf6', '#64748b'];

export function LeadSourceChart({ data }: { data: any[] }) {
  const counts: Record<string, number> = {};
  data.forEach((log) => {
    let portfolio = (log.portfolioDisplay || log["portfolioDisplay"] || log["Bank Name"] || log["Portfolio"] || log["Vehicle Model"] || "").trim();
    if (portfolio && portfolio !== "-") {
      if (portfolio.toLowerCase().includes("xuv seven") || portfolio.toLowerCase().includes("xuv700")) portfolio = "Federal Bank";
      else if (portfolio.toLowerCase().includes("xuv three") || portfolio.toLowerCase().includes("xuv300")) portfolio = "HDFC Bank";
      else if (portfolio.toLowerCase().includes("scorpio")) portfolio = "Muthoot Fin";
      else if (portfolio.toLowerCase().includes("thar")) portfolio = "SBI SARFAESI";
      counts[portfolio] = (counts[portfolio] || 0) + 1;
    }
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const top5 = sorted.slice(0, 5);
  const othersCount = sorted.slice(5).reduce((acc, curr) => acc + curr[1], 0);
  
  const chartData = top5.map(([key, val]) => ({ name: key, value: val }));
  if (othersCount > 0) {
    chartData.push({ name: "Others", value: othersCount });
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData.length > 0 ? chartData : [{ name: "Awaiting Cases", value: 1 }]}
            cx="40%"
            cy="50%"
            innerRadius={55}
            outerRadius={75}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {(chartData.length > 0 ? chartData : [{ name: "Awaiting Cases", value: 1 }]).map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend 
            layout="vertical" 
            verticalAlign="middle" 
            align="right"
            wrapperStyle={{ fontSize: '11px', color: '#888' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LeadStatusChart({ data }: { data: any[] }) {
  let ptp = 0;
  let ots = 0;
  let followUp = 0;

  data.forEach((log) => {
    const disp = (log.disposition || log["Enquiry Type"] || "").toLowerCase();
    const hasService = (log.settlementOffer && log.settlementOffer !== "-") || (log["Service Type"] && log["Service Type"].trim() !== "" && log["Service Type"].trim() !== "-") || disp.includes("settle");
    const hasVisit = (log.ptpDate && log.ptpDate !== "-") || (log["Visit Day"] && log["Visit Day"].trim() !== "" && log["Visit Day"].trim() !== "-") || disp.includes("ptp") || disp.includes("promise");
    
    if (hasService) ots++;
    else if (hasVisit) ptp++;
    else followUp++;
  });

  const chartData = [
    { name: "PTP (Promise to Pay)", value: ptp },
    { name: "OTS Settlement", value: ots },
    { name: "Pending Follow-up", value: followUp }
  ];

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="40%"
            cy="50%"
            innerRadius={0}
            outerRadius={75}
            dataKey="value"
            stroke="none"
          >
            <Cell fill="#0F5A2A" />
            <Cell fill="#E67E22" />
            <Cell fill="#64748b" />
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend 
            layout="vertical" 
            verticalAlign="middle" 
            align="right"
            wrapperStyle={{ fontSize: '11px', color: '#888' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
