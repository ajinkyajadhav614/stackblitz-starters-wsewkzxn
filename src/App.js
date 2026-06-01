import { useState, useMemo } from "react";

// ── DATA ────────────────────────────────────────────────────────────────────
const INITIAL_SERVICES = [
  "Aadhaar Card","PAN Card","Shop Act License","Food License",
  "Gazette Name Change","Income Certificate","Caste Certificate",
  "Domicile Certificate","Passport Application","PM Kisan",
  "PMAY","EWS Certificate","Voter ID","Ayushman Card",
];

const STATUS_META = {
  "New":               { color:"#3b82f6", bg:"#eff6ff", label:"New" },
  "Documents Pending": { color:"#f59e0b", bg:"#fffbeb", label:"Docs Pending" },
  "Applied":           { color:"#8b5cf6", bg:"#f5f3ff", label:"Applied" },
  "Under Process":     { color:"#0ea5e9", bg:"#f0f9ff", label:"In Process" },
  "Approved":          { color:"#10b981", bg:"#ecfdf5", label:"Approved" },
  "Completed":         { color:"#16a34a", bg:"#dcfce7", label:"Completed" },
  "Rejected":          { color:"#ef4444", bg:"#fef2f2", label:"Rejected" },
};

const PAYMENT_MODES = ["Cash","UPI","Bank Transfer","Card"];

const ROLES = ["Super Admin","Admin","Operator","Receptionist","Customer"];

const NAV_ITEMS = [
  { key:"dashboard",   icon:"▦",  label:"Dashboard"   },
  { key:"customers",   icon:"👥", label:"Customers"   },
  { key:"services",    icon:"📋", label:"Services"    },
  { key:"payments",    icon:"₹",  label:"Payments"    },
  { key:"followups",   icon:"🔔", label:"Follow-ups"  },
  { key:"reports",     icon:"📊", label:"Reports"     },
  { key:"staff",       icon:"👤", label:"Staff"       },
  { key:"kiosk",       icon:"🖥", label:"Kiosk"       },
];

// ── SEED DATA ────────────────────────────────────────────────────────────────
const seedCustomers = [
  { id:"C001", name:"Ramesh Patil",    mobile:"9876543210", whatsapp:"9876543210", email:"ramesh@gmail.com",    address:"Ramnagar, Jalna",   aadhaar:"XXXX-XXXX-1234", pan:"ABCDE1234F", dateAdded:"2026-04-10", notes:"Regular customer" },
  { id:"C002", name:"Sunita Deshpande",mobile:"9823456781", whatsapp:"9823456781", email:"sunita@yahoo.com",    address:"Ambad Road, Jalna",  aadhaar:"XXXX-XXXX-5678", pan:"FGHIJ5678K", dateAdded:"2026-04-15", notes:"" },
  { id:"C003", name:"Vijay Khamkar",   mobile:"9712345678", whatsapp:"9712345678", email:"vijay@gmail.com",     address:"Station Road, Jalna",aadhaar:"XXXX-XXXX-9012", pan:"KLMNO9012P", dateAdded:"2026-05-01", notes:"Follow up on Passport" },
  { id:"C004", name:"Priya Shinde",    mobile:"9934567890", whatsapp:"9934567890", email:"priya@outlook.com",   address:"Badnapur, Jalna",    aadhaar:"XXXX-XXXX-3456", pan:"QRSTU3456V", dateAdded:"2026-05-10", notes:"" },
  { id:"C005", name:"Anil Jadhav",     mobile:"9645678901", whatsapp:"9645678901", email:"anil@gmail.com",      address:"Mantha, Jalna",      aadhaar:"XXXX-XXXX-7890", pan:"VWXYZ7890A", dateAdded:"2026-05-20", notes:"Needs Income Cert urgently" },
];

const seedServices = [
  { id:"S001", customerId:"C001", customerName:"Ramesh Patil",    service:"PAN Card",              appNo:"PAN20260001", submitted:"2026-04-11", completed:"2026-04-25", status:"Completed",         staff:"Admin",     remarks:"Done" },
  { id:"S002", customerId:"C002", customerName:"Sunita Deshpande",service:"Aadhaar Card",           appNo:"ADH20260012", submitted:"2026-04-16", completed:"",          status:"Under Process",     staff:"Operator",  remarks:"" },
  { id:"S003", customerId:"C003", customerName:"Vijay Khamkar",   service:"Passport Application",  appNo:"PASS20260005",submitted:"2026-05-02", completed:"",          status:"Documents Pending", staff:"Receptionist",remarks:"Need DOB proof" },
  { id:"S004", customerId:"C004", customerName:"Priya Shinde",    service:"Income Certificate",    appNo:"INC20260018", submitted:"2026-05-11", completed:"",          status:"Applied",           staff:"Operator",  remarks:"" },
  { id:"S005", customerId:"C005", customerName:"Anil Jadhav",     service:"Caste Certificate",     appNo:"CAS20260007", submitted:"2026-05-21", completed:"",          status:"New",               staff:"Admin",     remarks:"Urgent" },
  { id:"S006", customerId:"C001", customerName:"Ramesh Patil",    service:"Shop Act License",      appNo:"SAL20260003", submitted:"2026-05-25", completed:"",          status:"Rejected",          staff:"Admin",     remarks:"Incomplete docs" },
];

const seedPayments = [
  { id:"P001", customerId:"C001", customerName:"Ramesh Patil",    serviceId:"S001", service:"PAN Card",             totalFees:500,  received:500,  pending:0,   date:"2026-04-11", mode:"UPI"  },
  { id:"P002", customerId:"C002", customerName:"Sunita Deshpande",serviceId:"S002", service:"Aadhaar Card",          totalFees:200,  received:200,  pending:0,   date:"2026-04-16", mode:"Cash" },
  { id:"P003", customerId:"C003", customerName:"Vijay Khamkar",   serviceId:"S003", service:"Passport Application",  totalFees:1500, received:750,  pending:750, date:"2026-05-02", mode:"Cash" },
  { id:"P004", customerId:"C004", customerName:"Priya Shinde",    serviceId:"S004", service:"Income Certificate",   totalFees:300,  received:300,  pending:0,   date:"2026-05-11", mode:"UPI"  },
  { id:"P005", customerId:"C005", customerName:"Anil Jadhav",     serviceId:"S005", service:"Caste Certificate",    totalFees:400,  received:200,  pending:200, date:"2026-05-21", mode:"Cash" },
];

const seedFollowups = [
  { id:"F001", customerId:"C003", customerName:"Vijay Khamkar",   serviceId:"S003", service:"Passport Application", nextDate:"2026-06-03", notes:"Collect DOB documents",  status:"Pending" },
  { id:"F002", customerId:"C005", customerName:"Anil Jadhav",     serviceId:"S005", service:"Caste Certificate",    nextDate:"2026-06-01", notes:"Remind about payment",    status:"Pending" },
  { id:"F003", customerId:"C002", customerName:"Sunita Deshpande",serviceId:"S002", service:"Aadhaar Card",          nextDate:"2026-05-28", notes:"Status check with office",status:"Done"    },
];

const seedStaff = [
  { id:"E001", name:"Suresh Kulkarni", mobile:"9811223344", role:"Admin",        username:"suresh",  active:true },
  { id:"E002", name:"Meena Pawar",     mobile:"9822334455", role:"Operator",     username:"meena",   active:true },
  { id:"E003", name:"Rakesh More",     mobile:"9833445566", role:"Receptionist", username:"rakesh",  active:true },
];

// ── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const today = "2026-06-01";

function Avatar({ name, size = 36 }) {
  const initials = name.split(" ").map(x => x[0]).slice(0,2).join("");
  const hue = [...name].reduce((h,c) => h + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `hsl(${hue},55%,52%)`,
      display:"flex",alignItems:"center",justifyContent:"center",
      color:"#fff",fontWeight:800,fontSize:size*0.35,flexShrink:0,
    }}>{initials}</div>
  );
}

function Badge({ label, meta }) {
  const m = meta || { color:"#6b7280", bg:"#f3f4f6" };
  return (
    <span style={{
      display:"inline-flex",alignItems:"center",gap:5,
      padding:"3px 10px",borderRadius:999,
      fontSize:11,fontWeight:700,letterSpacing:"0.04em",
      background:m.bg,color:m.color,
    }}>{label}</span>
  );
}

function KPI({ label, value, sub, accent, icon }) {
  return (
    <div style={{
      background:"#fff",borderRadius:14,padding:"18px 22px",
      border:"1.5px solid #eef2f7",
      boxShadow:"0 2px 8px rgba(0,70,160,0.05)",
      borderTop:`3px solid ${accent}`,
    }}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:"#8fa0b8",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>{label}</div>
          <div style={{fontSize:26,fontWeight:900,color:"#0f1e3d",lineHeight:1}}>{value}</div>
          {sub && <div style={{fontSize:12,color:"#8fa0b8",marginTop:5}}>{sub}</div>}
        </div>
        <div style={{fontSize:26,opacity:0.18}}>{icon}</div>
      </div>
    </div>
  );
}

const inputSt = {
  width:"100%",padding:"9px 12px",borderRadius:8,
  border:"1.5px solid #dbe4f0",fontSize:13.5,outline:"none",
  fontFamily:"inherit",background:"#f7faff",boxSizing:"border-box",color:"#0f1e3d",
};
const labelSt = {fontSize:11,fontWeight:700,color:"#8fa0b8",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4,display:"block"};
const btnPrimary = {background:"linear-gradient(135deg,#1e40af,#2563eb)",color:"#fff",border:"none",borderRadius:9,padding:"9px 20px",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 2px 8px rgba(37,99,235,0.3)"};
const btnOrange = {background:"linear-gradient(135deg,#ea580c,#f97316)",color:"#fff",border:"none",borderRadius:9,padding:"9px 20px",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"};
const btnGhost = {background:"#f0f4fa",color:"#374151",border:"none",borderRadius:9,padding:"9px 20px",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"};

// ── RECEIPT MODAL ─────────────────────────────────────────────────────────────
function ReceiptModal({ payment, onClose }) {
  const receiptNo = `RCT-${payment.id}`;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,30,80,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000}}>
      <div style={{background:"#fff",borderRadius:18,width:420,boxShadow:"0 24px 80px rgba(0,30,80,0.25)",overflow:"hidden"}}>
        <div style={{background:"linear-gradient(135deg,#1e40af,#2563eb)",padding:"20px 24px",color:"#fff"}}>
          <div style={{fontSize:18,fontWeight:900,letterSpacing:"-0.02em"}}>🙏 Ashirwad Multiservices</div>
          <div style={{fontSize:11,opacity:0.75,marginTop:2}}>H.N.1-29-325/1-2, Suvarnakar Nagar, Ramnagar, Jalna – 431203</div>
        </div>
        <div style={{padding:"20px 24px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:700,color:"#0f1e3d"}}>Receipt No: <span style={{color:"#2563eb"}}>{receiptNo}</span></div>
            <div style={{fontSize:12,color:"#8fa0b8"}}>{payment.date}</div>
          </div>
          {[
            ["Customer",payment.customerName],
            ["Service",payment.service],
            ["Payment Mode",payment.mode],
            ["Total Fees",fmt(payment.totalFees)],
            ["Received",fmt(payment.received)],
            ["Balance",fmt(payment.pending)],
          ].map(([k,v]) => (
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f0f4fa"}}>
              <span style={{fontSize:12.5,color:"#8fa0b8",fontWeight:600}}>{k}</span>
              <span style={{fontSize:13,color:"#0f1e3d",fontWeight:700}}>{v}</span>
            </div>
          ))}
          {payment.pending > 0 && (
            <div style={{marginTop:14,background:"#fff7ed",borderRadius:8,padding:"10px 14px",fontSize:12.5,color:"#c2410c",fontWeight:600}}>
              ⚠️ Balance amount of {fmt(payment.pending)} is pending.
            </div>
          )}
          <div style={{marginTop:18,display:"flex",gap:10}}>
            <button onClick={() => {
              const wa = `https://wa.me/${payment.customerId === "C001" ? "919876543210" : "919823456781"}?text=Dear ${payment.customerName}, your receipt ${receiptNo} for ${payment.service} is ready. Received: ${fmt(payment.received)}. Balance: ${fmt(payment.pending)}. - Ashirwad Multiservices`;
              window.open(wa,"_blank");
            }} style={{...btnOrange,flex:1,fontSize:12}}>📲 WhatsApp</button>
            <button onClick={onClose} style={{...btnGhost,flex:1,fontSize:12}}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [serviceTypes, setServiceTypes] = useState(INITIAL_SERVICES);
  const [editingServiceType, setEditingServiceType] = useState(null); // { index, value }
  const [newServiceTypeName, setNewServiceTypeName] = useState("");
  const [customers, setCustomers] = useState(seedCustomers);
  const [services, setServices] = useState(seedServices);
  const [payments, setPayments] = useState(seedPayments);
  const [followups, setFollowups] = useState(seedFollowups);
  const [staff, setStaff] = useState(seedStaff);
  const [search, setSearch] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modal, setModal] = useState(null); // "addCustomer"|"addService"|"addPayment"|"addFollowup"|"addStaff"
  const [kioskMobile, setKioskMobile] = useState("");
  const [kioskOTP, setKioskOTP] = useState("");
  const [kioskStep, setKioskStep] = useState("login"); // login|otp|portal
  const [kioskCustomer, setKioskCustomer] = useState(null);

  // form states
  const [nc, setNc] = useState({name:"",mobile:"",whatsapp:"",email:"",address:"",aadhaar:"",pan:"",notes:""});
  const [ns, setNs] = useState({customerId:"",service:"Aadhaar Card",appNo:"",submitted:today,status:"New",staff:"Admin",remarks:""});
  const [np, setNp] = useState({customerId:"",serviceId:"",totalFees:"",received:"",date:today,mode:"Cash"});
  const [nf, setNf] = useState({customerId:"",serviceId:"",nextDate:"",notes:""});
  const [nst, setNst] = useState({name:"",mobile:"",role:"Operator",username:""});

  // KPIs
  const totalRevenue = payments.reduce((s,p)=>s+p.received,0);
  const pendingBalance = payments.reduce((s,p)=>s+p.pending,0);
  const todayCollection = payments.filter(p=>p.date===today).reduce((s,p)=>s+p.received,0);
  const completedSvcs = services.filter(s=>s.status==="Completed").length;
  const pendingSvcs = services.filter(s=>!["Completed","Rejected"].includes(s.status)).length;
  const todayFollowups = followups.filter(f=>f.nextDate===today&&f.status!=="Done").length;

  const filteredCustomers = useMemo(()=>customers.filter(c=>
    c.name.toLowerCase().includes(search.toLowerCase())||
    c.mobile.includes(search)||
    c.id.toLowerCase().includes(search.toLowerCase())
  ),[customers,search]);

  // helpers
  const getCustomer = (id) => customers.find(c=>c.id===id);
  const getService = (id) => services.find(s=>s.id===id);

  const addCustomer = () => {
    if(!nc.name||!nc.mobile) return;
    const id = `C${String(customers.length+1).padStart(3,"0")}`;
    setCustomers(p=>[...p,{...nc,id,dateAdded:today}]);
    setNc({name:"",mobile:"",whatsapp:"",email:"",address:"",aadhaar:"",pan:"",notes:""});
    setModal(null);
  };
  const addService = () => {
    if(!ns.customerId||!ns.service) return;
    const cust = getCustomer(ns.customerId);
    const id = `S${String(services.length+1).padStart(3,"0")}`;
    setServices(p=>[...p,{...ns,id,customerName:cust?.name||"",completed:""}]);
    setNs({customerId:"",service:"Aadhaar Card",appNo:"",submitted:today,status:"New",staff:"Admin",remarks:""});
    setModal(null);
  };
  const addPayment = () => {
    if(!np.customerId||!np.totalFees) return;
    const cust = getCustomer(np.customerId);
    const svc = getService(np.serviceId);
    const id = `P${String(payments.length+1).padStart(3,"0")}`;
    const total=Number(np.totalFees), recv=Number(np.received);
    setPayments(p=>[...p,{...np,id,customerName:cust?.name||"",service:svc?.service||"",totalFees:total,received:recv,pending:total-recv}]);
    setNp({customerId:"",serviceId:"",totalFees:"",received:"",date:today,mode:"Cash"});
    setModal(null);
  };
  const addFollowup = () => {
    if(!nf.customerId) return;
    const cust = getCustomer(nf.customerId);
    const svc = getService(nf.serviceId);
    const id = `F${String(followups.length+1).padStart(3,"0")}`;
    setFollowups(p=>[...p,{...nf,id,customerName:cust?.name||"",service:svc?.service||"",status:"Pending"}]);
    setNf({customerId:"",serviceId:"",nextDate:"",notes:""});
    setModal(null);
  };
  const addStaff = () => {
    if(!nst.name||!nst.username) return;
    const id = `E${String(staff.length+1).padStart(3,"0")}`;
    setStaff(p=>[...p,{...nst,id,active:true}]);
    setNst({name:"",mobile:"",role:"Operator",username:""});
    setModal(null);
  };
  const markFollowupDone = (id) => setFollowups(p=>p.map(f=>f.id===id?{...f,status:"Done"}:f));
  const updateServiceStatus = (id, status) => setServices(p=>p.map(s=>s.id===id?{...s,status,completed:status==="Completed"?today:s.completed}:s));

  // Kiosk
  const kioskLogin = () => {
    const cust = customers.find(c=>c.mobile===kioskMobile);
    if(cust){ setKioskStep("otp"); }
    else alert("Mobile not registered.");
  };
  const kioskVerify = () => {
    if(kioskOTP==="1234"){
      setKioskCustomer(customers.find(c=>c.mobile===kioskMobile));
      setKioskStep("portal");
    } else alert("Invalid OTP. Use 1234 for demo.");
  };

  // ── LAYOUT ─────────────────────────────────────────────────────────────────
  return (
    <div style={{display:"flex",height:"100vh",fontFamily:"'Nunito','Segoe UI',sans-serif",background:"#f0f4fa",overflow:"hidden"}}>

      {/* Sidebar */}
      <div style={{width:220,background:"linear-gradient(180deg,#0f1e3d 0%,#1e3a6e 100%)",display:"flex",flexDirection:"column",padding:"0 0 16px",flexShrink:0,boxShadow:"3px 0 16px rgba(0,0,0,0.18)"}}>
        {/* Logo */}
        <div style={{padding:"22px 20px 18px",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#f97316,#ea580c)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🙏</div>
            <div>
              <div style={{fontSize:14,fontWeight:900,color:"#fff",letterSpacing:"-0.01em",lineHeight:1.1}}>Ashirwad</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.45)",fontWeight:600}}>Multiservices</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{padding:"12px 10px",flex:1,overflowY:"auto"}}>
          {NAV_ITEMS.map(n=>(
            <button key={n.key} onClick={()=>setTab(n.key)} style={{
              display:"flex",alignItems:"center",gap:10,width:"100%",
              padding:"9px 11px",borderRadius:9,border:"none",cursor:"pointer",
              background:tab===n.key?"rgba(255,255,255,0.12)":"transparent",
              color:tab===n.key?"#fff":"rgba(255,255,255,0.5)",
              fontWeight:tab===n.key?700:500,fontSize:13,
              fontFamily:"inherit",marginBottom:2,textAlign:"left",
              transition:"all 0.15s",
            }}>
              <span style={{fontSize:15,width:20,textAlign:"center"}}>{n.icon}</span>
              {n.label}
              {n.key==="followups"&&todayFollowups>0&&<span style={{marginLeft:"auto",background:"#ef4444",color:"#fff",borderRadius:999,padding:"1px 6px",fontSize:10,fontWeight:800}}>{todayFollowups}</span>}
            </button>
          ))}
        </nav>

        {/* User badge */}
        <div style={{padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,0.08)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#f97316,#fbbf24)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,color:"#fff"}}>SA</div>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>Super Admin</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>Full Access</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Topbar */}
        <div style={{background:"#fff",borderBottom:"1.5px solid #dbe4f0",padding:"13px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div>
            <div style={{fontSize:18,fontWeight:900,color:"#0f1e3d",letterSpacing:"-0.02em"}}>
              {NAV_ITEMS.find(n=>n.key===tab)?.label}
            </div>
            <div style={{fontSize:11,color:"#8fa0b8",marginTop:1}}>Ashirwad Multiservices · Jalna, Maharashtra · {today}</div>
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            {tab==="customers"&&<button onClick={()=>setModal("addCustomer")} style={btnPrimary}>+ Add Customer</button>}
            {tab==="services"&&<button onClick={()=>setModal("addService")} style={btnPrimary}>+ New Application</button>}
            {tab==="payments"&&<button onClick={()=>setModal("addPayment")} style={btnPrimary}>+ Record Payment</button>}
            {tab==="followups"&&<button onClick={()=>setModal("addFollowup")} style={btnPrimary}>+ Add Follow-up</button>}
            {tab==="staff"&&<button onClick={()=>setModal("addStaff")} style={btnPrimary}>+ Add Staff</button>}
          </div>
        </div>

        {/* Content */}
        <div style={{flex:1,overflowY:"auto",padding:"24px 28px"}}>

          {/* ── DASHBOARD ── */}
          {tab==="dashboard"&&(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
                <KPI label="Total Revenue"     value={fmt(totalRevenue)}    sub="All time collected"     accent="#2563eb" icon="₹"/>
                <KPI label="Today's Collection" value={fmt(todayCollection)} sub={`${today}`}             accent="#f97316" icon="📅"/>
                <KPI label="Pending Balance"   value={fmt(pendingBalance)}  sub="Awaiting payment"       accent="#ef4444" icon="⏳"/>
                <KPI label="Total Customers"   value={customers.length}     sub={`${services.length} applications`} accent="#10b981" icon="👥"/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
                <KPI label="Completed Services" value={completedSvcs}      sub="Successfully done"      accent="#10b981" icon="✅"/>
                <KPI label="Pending Services"   value={pendingSvcs}         sub="Needs attention"        accent="#f59e0b" icon="🔄"/>
                <KPI label="Today's Follow-ups" value={todayFollowups}      sub="Due today"              accent="#8b5cf6" icon="🔔"/>
                <KPI label="Staff Members"      value={staff.length}        sub="Active team"            accent="#0ea5e9" icon="👤"/>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:18}}>
                {/* Recent services */}
                <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #dbe4f0",padding:"18px 22px"}}>
                  <div style={{fontWeight:800,fontSize:14,color:"#0f1e3d",marginBottom:14}}>Recent Applications</div>
                  {services.slice(-5).reverse().map(s=>(
                    <div key={s.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid #f5f8ff"}}>
                      <Avatar name={s.customerName} size={34}/>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:13,color:"#0f1e3d"}}>{s.customerName}</div>
                        <div style={{fontSize:11.5,color:"#8fa0b8"}}>{s.service} · {s.appNo||"—"}</div>
                      </div>
                      <Badge label={STATUS_META[s.status]?.label||s.status} meta={STATUS_META[s.status]}/>
                    </div>
                  ))}
                </div>

                {/* Status distribution + today followups */}
                <div>
                  <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #dbe4f0",padding:"18px 22px",marginBottom:14}}>
                    <div style={{fontWeight:800,fontSize:14,color:"#0f1e3d",marginBottom:14}}>Status Overview</div>
                    {Object.entries(STATUS_META).map(([k,m])=>{
                      const count=services.filter(s=>s.status===k).length;
                      const pct=services.length?Math.round(count/services.length*100):0;
                      return (
                        <div key={k} style={{marginBottom:10}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                            <span style={{fontSize:12,fontWeight:600,color:"#374151"}}>{m.label}</span>
                            <span style={{fontSize:12,fontWeight:700,color:"#0f1e3d"}}>{count}</span>
                          </div>
                          <div style={{height:5,borderRadius:999,background:"#f0f4fa"}}>
                            <div style={{height:"100%",borderRadius:999,width:`${pct}%`,background:m.color,transition:"width 0.5s"}}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #dbe4f0",padding:"18px 22px"}}>
                    <div style={{fontWeight:800,fontSize:14,color:"#0f1e3d",marginBottom:12}}>Today's Follow-ups</div>
                    {followups.filter(f=>f.nextDate===today&&f.status!=="Done").length===0
                      ? <div style={{fontSize:12.5,color:"#8fa0b8",textAlign:"center",padding:"10px 0"}}>No follow-ups today 🎉</div>
                      : followups.filter(f=>f.nextDate===today&&f.status!=="Done").map(f=>(
                        <div key={f.id} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}>
                          <div style={{width:30,height:30,borderRadius:7,background:"#fff7ed",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>🔔</div>
                          <div style={{flex:1}}>
                            <div style={{fontSize:12.5,fontWeight:700,color:"#0f1e3d"}}>{f.customerName}</div>
                            <div style={{fontSize:11.5,color:"#8fa0b8"}}>{f.service}</div>
                          </div>
                          <button onClick={()=>markFollowupDone(f.id)} style={{...btnGhost,padding:"3px 9px",fontSize:11}}>Done</button>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── CUSTOMERS ── */}
          {tab==="customers"&&(
            <div>
              <div style={{display:"flex",gap:12,marginBottom:18}}>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, mobile, ID..." style={{...inputSt,width:300,background:"#fff"}}/>
                <div style={{marginLeft:"auto",fontSize:13,color:"#8fa0b8",display:"flex",alignItems:"center"}}>{filteredCustomers.length} customers</div>
              </div>
              <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #dbe4f0",overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{background:"#f5f8ff",borderBottom:"1.5px solid #dbe4f0"}}>
                      {["Customer ID","Name","Mobile","Services","Date Added","Actions"].map(h=>(
                        <th key={h} style={{padding:"11px 16px",textAlign:"left",fontSize:11,fontWeight:800,color:"#8fa0b8",textTransform:"uppercase",letterSpacing:"0.07em"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map(c=>{
                      const custSvcs = services.filter(s=>s.customerId===c.id);
                      return (
                        <tr key={c.id} style={{borderBottom:"1px solid #f5f8ff",cursor:"pointer",background:selectedCustomer?.id===c.id?"#f0f7ff":"transparent"}}
                          onClick={()=>setSelectedCustomer(selectedCustomer?.id===c.id?null:c)}>
                          <td style={{padding:"12px 16px",fontSize:12,fontWeight:700,color:"#2563eb"}}>{c.id}</td>
                          <td style={{padding:"12px 16px"}}>
                            <div style={{display:"flex",alignItems:"center",gap:10}}>
                              <Avatar name={c.name} size={32}/>
                              <div>
                                <div style={{fontWeight:700,fontSize:13,color:"#0f1e3d"}}>{c.name}</div>
                                <div style={{fontSize:11,color:"#8fa0b8"}}>{c.email||"—"}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{padding:"12px 16px"}}>
                            <div style={{fontSize:13,color:"#0f1e3d",fontWeight:600}}>{c.mobile}</div>
                          </td>
                          <td style={{padding:"12px 16px",fontSize:13,color:"#374151"}}>{custSvcs.length} application{custSvcs.length!==1?"s":""}</td>
                          <td style={{padding:"12px 16px",fontSize:12,color:"#8fa0b8"}}>{c.dateAdded}</td>
                          <td style={{padding:"12px 16px"}}>
                            <div style={{display:"flex",gap:6}}>
                              <a href={`https://wa.me/91${c.whatsapp}`} target="_blank" rel="noreferrer"
                                style={{background:"#dcfce7",color:"#16a34a",border:"none",borderRadius:6,padding:"4px 8px",fontSize:11,fontWeight:700,cursor:"pointer",textDecoration:"none"}} onClick={e=>e.stopPropagation()}>📲 WA</a>
                              <a href={`tel:${c.mobile}`}
                                style={{background:"#eff6ff",color:"#2563eb",border:"none",borderRadius:6,padding:"4px 8px",fontSize:11,fontWeight:700,cursor:"pointer",textDecoration:"none"}} onClick={e=>e.stopPropagation()}>📞</a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Customer detail panel */}
              {selectedCustomer&&(
                <div style={{marginTop:18,background:"#fff",borderRadius:14,border:"1.5px solid #dbe4f0",padding:"22px 26px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
                    <Avatar name={selectedCustomer.name} size={48}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:18,fontWeight:900,color:"#0f1e3d"}}>{selectedCustomer.name}</div>
                      <div style={{fontSize:13,color:"#8fa0b8"}}>{selectedCustomer.id} · Added {selectedCustomer.dateAdded}</div>
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:18}}>
                    {[["Mobile",selectedCustomer.mobile],["WhatsApp",selectedCustomer.whatsapp],["Email",selectedCustomer.email||"—"],["Address",selectedCustomer.address],["Aadhaar",selectedCustomer.aadhaar],["PAN",selectedCustomer.pan]].map(([k,v])=>(
                      <div key={k}><div style={{...labelSt}}>{k}</div><div style={{fontSize:13,fontWeight:600,color:"#0f1e3d"}}>{v}</div></div>
                    ))}
                  </div>
                  {selectedCustomer.notes&&<div style={{background:"#fffbeb",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#92400e"}}><b>Note:</b> {selectedCustomer.notes}</div>}
                  <div style={{marginTop:18}}>
                    <div style={{fontWeight:800,fontSize:13,color:"#0f1e3d",marginBottom:10}}>Service History</div>
                    {services.filter(s=>s.customerId===selectedCustomer.id).map(s=>(
                      <div key={s.id} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:"1px solid #f5f8ff"}}>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:700,color:"#0f1e3d"}}>{s.service}</div>
                          <div style={{fontSize:11,color:"#8fa0b8"}}>{s.appNo||"—"} · {s.submitted}</div>
                        </div>
                        <Badge label={STATUS_META[s.status]?.label||s.status} meta={STATUS_META[s.status]}/>
                        <select value={s.status} onChange={e=>updateServiceStatus(s.id,e.target.value)}
                          style={{...inputSt,width:140,padding:"5px 8px",fontSize:12}} onClick={e=>e.stopPropagation()}>
                          {Object.keys(STATUS_META).map(k=><option key={k}>{k}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── SERVICES ── */}
          {tab==="services"&&(
            <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:18,alignItems:"start"}}>

              {/* ── LEFT: Service Types Panel ── */}
              <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #dbe4f0",overflow:"hidden",position:"sticky",top:0}}>
                <div style={{background:"linear-gradient(135deg,#1e40af,#2563eb)",padding:"14px 16px"}}>
                  <div style={{fontSize:13,fontWeight:900,color:"#fff"}}>📋 Service Types</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.6)",marginTop:2}}>{serviceTypes.length} services configured</div>
                </div>

                {/* Add new inline */}
                <div style={{padding:"12px 14px",borderBottom:"1.5px solid #f0f4fa"}}>
                  <div style={{display:"flex",gap:7}}>
                    <input
                      value={newServiceTypeName}
                      onChange={e=>setNewServiceTypeName(e.target.value)}
                      onKeyDown={e=>{
                        if(e.key==="Enter"){
                          const t=newServiceTypeName.trim();
                          if(t&&!serviceTypes.includes(t)){setServiceTypes(p=>[...p,t]);setNewServiceTypeName("");}
                        }
                      }}
                      placeholder="Add new service…"
                      style={{...inputSt,flex:1,fontSize:12,padding:"7px 10px"}}
                    />
                    <button onClick={()=>{
                      const t=newServiceTypeName.trim();
                      if(t&&!serviceTypes.includes(t)){setServiceTypes(p=>[...p,t]);setNewServiceTypeName("");}
                    }} style={{...btnPrimary,padding:"7px 13px",fontSize:13,borderRadius:7}}>+</button>
                  </div>
                </div>

                {/* List */}
                <div style={{maxHeight:480,overflowY:"auto"}}>
                  {serviceTypes.map((svc,i)=>(
                    <div key={i} style={{
                      borderBottom:"1px solid #f5f8ff",
                      background: editingServiceType?.index===i ? "#f0f7ff" : "transparent",
                    }}>
                      {editingServiceType?.index===i ? (
                        <div style={{display:"flex",gap:6,padding:"8px 10px",alignItems:"center"}}>
                          <input
                            autoFocus
                            value={editingServiceType.value}
                            onChange={e=>setEditingServiceType(p=>({...p,value:e.target.value}))}
                            onKeyDown={e=>{
                              if(e.key==="Enter"){
                                const v=editingServiceType.value.trim();
                                if(v){setServiceTypes(p=>p.map((s,idx)=>idx===i?v:s));setServices(prev=>prev.map(s=>s.service===svc?{...s,service:v}:s));}
                                setEditingServiceType(null);
                              }
                              if(e.key==="Escape") setEditingServiceType(null);
                            }}
                            style={{...inputSt,flex:1,fontSize:12,padding:"5px 8px"}}
                          />
                          <button onClick={()=>{
                            const v=editingServiceType.value.trim();
                            if(v){setServiceTypes(p=>p.map((s,idx)=>idx===i?v:s));setServices(prev=>prev.map(s=>s.service===svc?{...s,service:v}:s));}
                            setEditingServiceType(null);
                          }} style={{background:"#2563eb",color:"#fff",border:"none",borderRadius:6,padding:"5px 9px",fontSize:12,fontWeight:700,cursor:"pointer"}}>✓</button>
                          <button onClick={()=>setEditingServiceType(null)} style={{background:"#f3f4f6",color:"#6b7280",border:"none",borderRadius:6,padding:"5px 8px",fontSize:12,fontWeight:700,cursor:"pointer"}}>✕</button>
                        </div>
                      ) : (
                        <div style={{display:"flex",alignItems:"center",padding:"9px 12px",gap:8}}>
                          <div style={{width:6,height:6,borderRadius:"50%",background:"#2563eb",flexShrink:0,opacity:0.5}}/>
                          <span style={{flex:1,fontSize:12.5,fontWeight:600,color:"#0f1e3d",lineHeight:1.3}}>{svc}</span>
                          <span style={{fontSize:10,color:"#bfcad8",fontWeight:600,flexShrink:0}}>
                            {services.filter(s=>s.service===svc).length}
                          </span>
                          <button
                            onClick={()=>setEditingServiceType({index:i,value:svc})}
                            title="Rename"
                            style={{background:"none",border:"none",cursor:"pointer",color:"#93afd4",fontSize:12,padding:"2px 4px",lineHeight:1}}>✏️</button>
                          <button
                            onClick={()=>{
                              if(services.some(s=>s.service===svc)){
                                alert(`"${svc}" is used in ${services.filter(s=>s.service===svc).length} application(s). Update those first.`);return;
                              }
                              if(window.confirm(`Remove "${svc}"?`)) setServiceTypes(p=>p.filter((_,idx)=>idx!==i));
                            }}
                            title="Remove"
                            style={{background:"none",border:"none",cursor:"pointer",color:"#f87171",fontSize:12,padding:"2px 4px",lineHeight:1}}>🗑</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── RIGHT: Applications Table ── */}
              <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #dbe4f0",overflow:"hidden"}}>
                <div style={{padding:"14px 18px",borderBottom:"1.5px solid #f0f4fa",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{fontSize:13,fontWeight:800,color:"#0f1e3d"}}>Applications</div>
                  <span style={{fontSize:12,color:"#8fa0b8"}}>{services.length} total</span>
                </div>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead>
                      <tr style={{background:"#f5f8ff",borderBottom:"1.5px solid #dbe4f0"}}>
                        {["ID","Customer","Service","App No.","Submitted","Status","Staff","Update Status"].map(h=>(
                          <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:800,color:"#8fa0b8",textTransform:"uppercase",letterSpacing:"0.07em",whiteSpace:"nowrap"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {services.map(s=>(
                        <tr key={s.id} style={{borderBottom:"1px solid #f5f8ff"}}>
                          <td style={{padding:"11px 14px",fontSize:12,fontWeight:700,color:"#2563eb"}}>{s.id}</td>
                          <td style={{padding:"11px 14px"}}>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <Avatar name={s.customerName} size={28}/>
                              <span style={{fontSize:13,fontWeight:600,color:"#0f1e3d",whiteSpace:"nowrap"}}>{s.customerName}</span>
                            </div>
                          </td>
                          <td style={{padding:"11px 14px",fontSize:12.5,color:"#374151",fontWeight:600,whiteSpace:"nowrap"}}>{s.service}</td>
                          <td style={{padding:"11px 14px",fontSize:12,color:"#8fa0b8",whiteSpace:"nowrap"}}>{s.appNo||"—"}</td>
                          <td style={{padding:"11px 14px",fontSize:12,color:"#8fa0b8",whiteSpace:"nowrap"}}>{s.submitted}</td>
                          <td style={{padding:"11px 14px"}}>
                            <Badge label={STATUS_META[s.status]?.label||s.status} meta={STATUS_META[s.status]}/>
                          </td>
                          <td style={{padding:"11px 14px",fontSize:12,color:"#374151"}}>{s.staff}</td>
                          <td style={{padding:"11px 14px"}}>
                            <select value={s.status} onChange={e=>updateServiceStatus(s.id,e.target.value)} style={{...inputSt,width:130,padding:"5px 8px",fontSize:12}}>
                              {Object.keys(STATUS_META).map(k=><option key={k}>{k}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── PAYMENTS ── */}
          {tab==="payments"&&(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
                <KPI label="Total Collected" value={fmt(totalRevenue)} sub="All payments" accent="#2563eb" icon="₹"/>
                <KPI label="Cash"  value={fmt(payments.filter(p=>p.mode==="Cash").reduce((s,p)=>s+p.received,0))} sub="Cash payments" accent="#10b981" icon="💵"/>
                <KPI label="UPI"   value={fmt(payments.filter(p=>p.mode==="UPI").reduce((s,p)=>s+p.received,0))}  sub="UPI payments"  accent="#8b5cf6" icon="📱"/>
                <KPI label="Pending Balance" value={fmt(pendingBalance)} sub="Outstanding" accent="#ef4444" icon="⚠️"/>
              </div>
              <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #dbe4f0",overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{background:"#f5f8ff",borderBottom:"1.5px solid #dbe4f0"}}>
                      {["Receipt","Customer","Service","Total","Received","Pending","Mode","Date","Receipt"].map(h=>(
                        <th key={h} style={{padding:"11px 14px",textAlign:"left",fontSize:11,fontWeight:800,color:"#8fa0b8",textTransform:"uppercase",letterSpacing:"0.07em"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p=>(
                      <tr key={p.id} style={{borderBottom:"1px solid #f5f8ff"}}>
                        <td style={{padding:"11px 14px",fontSize:12,fontWeight:700,color:"#2563eb"}}>RCT-{p.id}</td>
                        <td style={{padding:"11px 14px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <Avatar name={p.customerName} size={28}/>
                            <span style={{fontSize:13,fontWeight:600,color:"#0f1e3d"}}>{p.customerName}</span>
                          </div>
                        </td>
                        <td style={{padding:"11px 14px",fontSize:12.5,color:"#374151"}}>{p.service}</td>
                        <td style={{padding:"11px 14px",fontSize:13,fontWeight:700,color:"#0f1e3d"}}>{fmt(p.totalFees)}</td>
                        <td style={{padding:"11px 14px",fontSize:13,fontWeight:700,color:"#16a34a"}}>{fmt(p.received)}</td>
                        <td style={{padding:"11px 14px"}}>
                          {p.pending>0
                            ? <span style={{fontSize:13,fontWeight:700,color:"#ef4444"}}>{fmt(p.pending)}</span>
                            : <span style={{fontSize:12,fontWeight:700,color:"#16a34a"}}>Cleared ✓</span>}
                        </td>
                        <td style={{padding:"11px 14px"}}>
                          <span style={{fontSize:11,fontWeight:700,background:"#f0f4fa",color:"#374151",padding:"2px 8px",borderRadius:999}}>{p.mode}</span>
                        </td>
                        <td style={{padding:"11px 14px",fontSize:12,color:"#8fa0b8"}}>{p.date}</td>
                        <td style={{padding:"11px 14px"}}>
                          <button onClick={()=>setReceipt(p)} style={{...btnPrimary,padding:"4px 10px",fontSize:11}}>🧾 View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── FOLLOW-UPS ── */}
          {tab==="followups"&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
              <div>
                <div style={{fontWeight:800,fontSize:14,color:"#0f1e3d",marginBottom:14}}>⏳ Pending</div>
                {followups.filter(f=>f.status!=="Done").map(f=>(
                  <div key={f.id} style={{background:"#fff",borderRadius:12,border:"1.5px solid #dbe4f0",padding:"14px 16px",marginBottom:10}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                      <Avatar name={f.customerName} size={36}/>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:13,color:"#0f1e3d"}}>{f.customerName}</div>
                        <div style={{fontSize:12,color:"#8fa0b8",marginTop:2}}>{f.service}</div>
                        <div style={{fontSize:12.5,color:"#374151",marginTop:5}}>{f.notes}</div>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}>
                          <span style={{fontSize:11,fontWeight:700,background:f.nextDate===today?"#fff7ed":"#f5f8ff",color:f.nextDate===today?"#c2410c":"#8fa0b8",padding:"2px 8px",borderRadius:999}}>
                            📅 {f.nextDate===today?"Today":f.nextDate}
                          </span>
                          <a href={`https://wa.me/91${customers.find(c=>c.id===f.customerId)?.whatsapp||""}`} target="_blank" rel="noreferrer"
                            style={{fontSize:11,fontWeight:700,background:"#dcfce7",color:"#16a34a",padding:"2px 8px",borderRadius:999,textDecoration:"none"}}>📲 Remind</a>
                        </div>
                      </div>
                      <button onClick={()=>markFollowupDone(f.id)} style={{...btnGhost,padding:"5px 12px",fontSize:11}}>✓ Done</button>
                    </div>
                  </div>
                ))}
                {followups.filter(f=>f.status!=="Done").length===0&&<div style={{background:"#f5f8ff",borderRadius:12,padding:20,textAlign:"center",color:"#8fa0b8",fontSize:13}}>All caught up! 🎉</div>}
              </div>
              <div>
                <div style={{fontWeight:800,fontSize:14,color:"#0f1e3d",marginBottom:14}}>✅ Completed</div>
                {followups.filter(f=>f.status==="Done").map(f=>(
                  <div key={f.id} style={{background:"#f9fbff",borderRadius:12,border:"1.5px solid #e8eef8",padding:"14px 16px",marginBottom:10,opacity:0.75}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <Avatar name={f.customerName} size={30}/>
                      <div>
                        <div style={{fontWeight:700,fontSize:13,color:"#374151",textDecoration:"line-through"}}>{f.customerName}</div>
                        <div style={{fontSize:11,color:"#8fa0b8"}}>{f.service} · {f.nextDate}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── REPORTS ── */}
          {tab==="reports"&&(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:18}}>
                {/* Collection report */}
                <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #dbe4f0",padding:"20px 24px"}}>
                  <div style={{fontWeight:800,fontSize:14,color:"#0f1e3d",marginBottom:14}}>💰 Daily Collection Report</div>
                  {[["Total Payments",fmt(totalRevenue)],["Cash",fmt(payments.filter(p=>p.mode==="Cash").reduce((s,p)=>s+p.received,0))],["UPI",fmt(payments.filter(p=>p.mode==="UPI").reduce((s,p)=>s+p.received,0))],["Bank Transfer",fmt(payments.filter(p=>p.mode==="Bank Transfer").reduce((s,p)=>s+p.received,0))],["Pending Balance",fmt(pendingBalance)]].map(([k,v])=>(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid #f5f8ff"}}>
                      <span style={{fontSize:13,color:"#6b7280",fontWeight:600}}>{k}</span>
                      <span style={{fontSize:13,fontWeight:800,color:"#0f1e3d"}}>{v}</span>
                    </div>
                  ))}
                </div>

                {/* Service report */}
                <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #dbe4f0",padding:"20px 24px"}}>
                  <div style={{fontWeight:800,fontSize:14,color:"#0f1e3d",marginBottom:14}}>📋 Service Report</div>
                  {Object.entries(STATUS_META).map(([k,m])=>{
                    const count=services.filter(s=>s.status===k).length;
                    return (
                      <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid #f5f8ff"}}>
                        <Badge label={m.label} meta={m}/>
                        <span style={{fontSize:14,fontWeight:800,color:"#0f1e3d"}}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Service-wise revenue */}
              <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #dbe4f0",padding:"20px 24px"}}>
                <div style={{fontWeight:800,fontSize:14,color:"#0f1e3d",marginBottom:14}}>📊 Revenue by Service</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
                  {serviceTypes.map(svc=>{
                    const rev=payments.filter(p=>p.service===svc).reduce((s,p)=>s+p.received,0);
                    const cnt=services.filter(s=>s.service===svc).length;
                    return (
                      <div key={svc} style={{background:"#f5f8ff",borderRadius:10,padding:"12px 14px"}}>
                        <div style={{fontSize:12.5,fontWeight:700,color:"#0f1e3d",marginBottom:4}}>{svc}</div>
                        <div style={{fontSize:11,color:"#8fa0b8"}}>{cnt} application{cnt!==1?"s":""}</div>
                        <div style={{fontSize:14,fontWeight:900,color:"#2563eb",marginTop:4}}>{rev>0?fmt(rev):"—"}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── STAFF ── */}
          {tab==="staff"&&(
            <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #dbe4f0",overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:"#f5f8ff",borderBottom:"1.5px solid #dbe4f0"}}>
                    {["ID","Name","Mobile","Role","Username","Status"].map(h=>(
                      <th key={h} style={{padding:"11px 16px",textAlign:"left",fontSize:11,fontWeight:800,color:"#8fa0b8",textTransform:"uppercase",letterSpacing:"0.07em"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {staff.map(s=>(
                    <tr key={s.id} style={{borderBottom:"1px solid #f5f8ff"}}>
                      <td style={{padding:"12px 16px",fontSize:12,fontWeight:700,color:"#2563eb"}}>{s.id}</td>
                      <td style={{padding:"12px 16px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <Avatar name={s.name} size={32}/>
                          <span style={{fontWeight:700,fontSize:13,color:"#0f1e3d"}}>{s.name}</span>
                        </div>
                      </td>
                      <td style={{padding:"12px 16px",fontSize:13,color:"#374151"}}>{s.mobile}</td>
                      <td style={{padding:"12px 16px"}}>
                        <span style={{fontSize:11,fontWeight:700,background:"#eff6ff",color:"#2563eb",padding:"3px 10px",borderRadius:999}}>{s.role}</span>
                      </td>
                      <td style={{padding:"12px 16px",fontSize:13,color:"#374151",fontFamily:"monospace"}}>{s.username}</td>
                      <td style={{padding:"12px 16px"}}>
                        <span style={{fontSize:11,fontWeight:700,background:s.active?"#dcfce7":"#fee2e2",color:s.active?"#16a34a":"#dc2626",padding:"3px 10px",borderRadius:999}}>{s.active?"Active":"Inactive"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── KIOSK ── */}
          {tab==="kiosk"&&(
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}>
              {kioskStep==="login"&&(
                <div style={{background:"#fff",borderRadius:20,padding:"40px 48px",width:400,boxShadow:"0 8px 40px rgba(0,30,80,0.12)",textAlign:"center"}}>
                  <div style={{fontSize:36,marginBottom:10}}>🙏</div>
                  <div style={{fontSize:22,fontWeight:900,color:"#0f1e3d",marginBottom:4}}>Customer Portal</div>
                  <div style={{fontSize:13,color:"#8fa0b8",marginBottom:28}}>Ashirwad Multiservices · Jalna</div>
                  <label style={{...labelSt,textAlign:"left"}}>Your Mobile Number</label>
                  <input value={kioskMobile} onChange={e=>setKioskMobile(e.target.value)} placeholder="Enter 10-digit mobile" style={{...inputSt,marginBottom:16,textAlign:"center",fontSize:16,letterSpacing:"0.1em"}}/>
                  <button onClick={kioskLogin} style={{...btnPrimary,width:"100%",padding:"12px",fontSize:15}}>Send OTP</button>
                  <div style={{fontSize:11,color:"#8fa0b8",marginTop:16}}>Try: 9876543210</div>
                </div>
              )}
              {kioskStep==="otp"&&(
                <div style={{background:"#fff",borderRadius:20,padding:"40px 48px",width:400,boxShadow:"0 8px 40px rgba(0,30,80,0.12)",textAlign:"center"}}>
                  <div style={{fontSize:36,marginBottom:10}}>📱</div>
                  <div style={{fontSize:20,fontWeight:900,color:"#0f1e3d",marginBottom:4}}>Enter OTP</div>
                  <div style={{fontSize:13,color:"#8fa0b8",marginBottom:28}}>Sent to {kioskMobile}</div>
                  <input value={kioskOTP} onChange={e=>setKioskOTP(e.target.value)} placeholder="Enter OTP" style={{...inputSt,marginBottom:16,textAlign:"center",fontSize:22,letterSpacing:"0.3em"}}/>
                  <button onClick={kioskVerify} style={{...btnPrimary,width:"100%",padding:"12px",fontSize:15}}>Verify OTP</button>
                  <button onClick={()=>setKioskStep("login")} style={{...btnGhost,width:"100%",marginTop:10,padding:"10px",fontSize:13}}>← Back</button>
                  <div style={{fontSize:11,color:"#8fa0b8",marginTop:12}}>Demo OTP: 1234</div>
                </div>
              )}
              {kioskStep==="portal"&&kioskCustomer&&(
                <div style={{width:"100%",maxWidth:700}}>
                  <div style={{background:"linear-gradient(135deg,#1e40af,#2563eb)",borderRadius:16,padding:"22px 28px",marginBottom:18,display:"flex",alignItems:"center",gap:16}}>
                    <Avatar name={kioskCustomer.name} size={52}/>
                    <div>
                      <div style={{fontSize:20,fontWeight:900,color:"#fff"}}>Welcome, {kioskCustomer.name.split(" ")[0]}!</div>
                      <div style={{fontSize:13,color:"rgba(255,255,255,0.65)"}}>Customer ID: {kioskCustomer.id}</div>
                    </div>
                    <button onClick={()=>{setKioskStep("login");setKioskMobile("");setKioskOTP("");setKioskCustomer(null);}} style={{marginLeft:"auto",...btnGhost,padding:"6px 14px",fontSize:12}}>Logout</button>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                    <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #dbe4f0",padding:"18px 22px"}}>
                      <div style={{fontWeight:800,fontSize:14,color:"#0f1e3d",marginBottom:14}}>📋 My Applications</div>
                      {services.filter(s=>s.customerId===kioskCustomer.id).map(s=>(
                        <div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid #f5f8ff"}}>
                          <div>
                            <div style={{fontSize:13,fontWeight:700,color:"#0f1e3d"}}>{s.service}</div>
                            <div style={{fontSize:11,color:"#8fa0b8"}}>{s.appNo||"—"}</div>
                          </div>
                          <Badge label={STATUS_META[s.status]?.label||s.status} meta={STATUS_META[s.status]}/>
                        </div>
                      ))}
                    </div>
                    <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #dbe4f0",padding:"18px 22px"}}>
                      <div style={{fontWeight:800,fontSize:14,color:"#0f1e3d",marginBottom:14}}>💳 Payment History</div>
                      {payments.filter(p=>p.customerId===kioskCustomer.id).map(p=>(
                        <div key={p.id} style={{padding:"9px 0",borderBottom:"1px solid #f5f8ff"}}>
                          <div style={{display:"flex",justifyContent:"space-between"}}>
                            <span style={{fontSize:13,fontWeight:700,color:"#0f1e3d"}}>{p.service}</span>
                            <span style={{fontSize:13,fontWeight:700,color:"#16a34a"}}>{fmt(p.received)}</span>
                          </div>
                          {p.pending>0&&<div style={{fontSize:11,color:"#ef4444",fontWeight:600}}>Balance: {fmt(p.pending)}</div>}
                          <div style={{fontSize:11,color:"#8fa0b8"}}>{p.date} · {p.mode}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── MODALS ── */}
      {modal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,30,80,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <div style={{background:"#fff",borderRadius:18,padding:"26px 32px",width:480,boxShadow:"0 24px 80px rgba(0,30,80,0.2)",maxHeight:"90vh",overflowY:"auto"}}>

            {modal==="addCustomer"&&(
              <>
                <div style={{fontSize:17,fontWeight:900,color:"#0f1e3d",marginBottom:20}}>👥 Add New Customer</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  {[["Full Name","name","text"],["Mobile","mobile","tel"],["WhatsApp","whatsapp","tel"],["Email","email","email"],["Aadhaar Number","aadhaar","text"],["PAN Number","pan","text"]].map(([l,k,t])=>(
                    <div key={k}><label style={labelSt}>{l}</label><input type={t} value={nc[k]} onChange={e=>setNc(p=>({...p,[k]:e.target.value}))} style={inputSt}/></div>
                  ))}
                </div>
                <div style={{marginTop:12}}><label style={labelSt}>Address</label><input value={nc.address} onChange={e=>setNc(p=>({...p,address:e.target.value}))} style={inputSt}/></div>
                <div style={{marginTop:12}}><label style={labelSt}>Notes</label><textarea value={nc.notes} onChange={e=>setNc(p=>({...p,notes:e.target.value}))} style={{...inputSt,height:60,resize:"vertical"}}/></div>
                <div style={{display:"flex",gap:10,marginTop:20,justifyContent:"flex-end"}}>
                  <button onClick={()=>setModal(null)} style={btnGhost}>Cancel</button>
                  <button onClick={addCustomer} style={btnPrimary}>Add Customer</button>
                </div>
              </>
            )}

            {modal==="addService"&&(
              <>
                <div style={{fontSize:17,fontWeight:900,color:"#0f1e3d",marginBottom:20}}>📋 New Application</div>
                <div style={{marginBottom:12}}>
                  <label style={labelSt}>Customer</label>
                  <select value={ns.customerId} onChange={e=>setNs(p=>({...p,customerId:e.target.value}))} style={inputSt}>
                    <option value="">Select customer…</option>
                    {customers.map(c=><option key={c.id} value={c.id}>{c.name} ({c.id})</option>)}
                  </select>
                </div>
                <div style={{marginBottom:12}}>
                  <label style={labelSt}>Service</label>
                  <select value={ns.service} onChange={e=>setNs(p=>({...p,service:e.target.value}))} style={inputSt}>
                    {serviceTypes.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                  <div><label style={labelSt}>Application No.</label><input value={ns.appNo} onChange={e=>setNs(p=>({...p,appNo:e.target.value}))} style={inputSt}/></div>
                  <div><label style={labelSt}>Submission Date</label><input type="date" value={ns.submitted} onChange={e=>setNs(p=>({...p,submitted:e.target.value}))} style={inputSt}/></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                  <div>
                    <label style={labelSt}>Status</label>
                    <select value={ns.status} onChange={e=>setNs(p=>({...p,status:e.target.value}))} style={inputSt}>
                      {Object.keys(STATUS_META).map(k=><option key={k}>{k}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelSt}>Assigned Staff</label>
                    <select value={ns.staff} onChange={e=>setNs(p=>({...p,staff:e.target.value}))} style={inputSt}>
                      {["Admin","Operator","Receptionist"].map(r=><option key={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div><label style={labelSt}>Remarks</label><input value={ns.remarks} onChange={e=>setNs(p=>({...p,remarks:e.target.value}))} style={inputSt}/></div>
                <div style={{display:"flex",gap:10,marginTop:20,justifyContent:"flex-end"}}>
                  <button onClick={()=>setModal(null)} style={btnGhost}>Cancel</button>
                  <button onClick={addService} style={btnPrimary}>Add Application</button>
                </div>
              </>
            )}

            {modal==="addPayment"&&(
              <>
                <div style={{fontSize:17,fontWeight:900,color:"#0f1e3d",marginBottom:20}}>₹ Record Payment</div>
                <div style={{marginBottom:12}}>
                  <label style={labelSt}>Customer</label>
                  <select value={np.customerId} onChange={e=>setNp(p=>({...p,customerId:e.target.value}))} style={inputSt}>
                    <option value="">Select customer…</option>
                    {customers.map(c=><option key={c.id} value={c.id}>{c.name} ({c.id})</option>)}
                  </select>
                </div>
                <div style={{marginBottom:12}}>
                  <label style={labelSt}>Service</label>
                  <select value={np.serviceId} onChange={e=>setNp(p=>({...p,serviceId:e.target.value}))} style={inputSt}>
                    <option value="">Select service…</option>
                    {services.filter(s=>!np.customerId||s.customerId===np.customerId).map(s=><option key={s.id} value={s.id}>{s.service}</option>)}
                  </select>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                  <div><label style={labelSt}>Total Fees (₹)</label><input type="number" value={np.totalFees} onChange={e=>setNp(p=>({...p,totalFees:e.target.value}))} style={inputSt}/></div>
                  <div><label style={labelSt}>Received (₹)</label><input type="number" value={np.received} onChange={e=>setNp(p=>({...p,received:e.target.value}))} style={inputSt}/></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                  <div>
                    <label style={labelSt}>Payment Mode</label>
                    <select value={np.mode} onChange={e=>setNp(p=>({...p,mode:e.target.value}))} style={inputSt}>
                      {PAYMENT_MODES.map(m=><option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div><label style={labelSt}>Date</label><input type="date" value={np.date} onChange={e=>setNp(p=>({...p,date:e.target.value}))} style={inputSt}/></div>
                </div>
                {np.totalFees&&np.received&&Number(np.totalFees)>Number(np.received)&&(
                  <div style={{background:"#fff7ed",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#c2410c",fontWeight:600}}>
                    ⚠️ Pending: {fmt(Number(np.totalFees)-Number(np.received))}
                  </div>
                )}
                <div style={{display:"flex",gap:10,marginTop:20,justifyContent:"flex-end"}}>
                  <button onClick={()=>setModal(null)} style={btnGhost}>Cancel</button>
                  <button onClick={addPayment} style={btnPrimary}>Record Payment</button>
                </div>
              </>
            )}

            {modal==="addFollowup"&&(
              <>
                <div style={{fontSize:17,fontWeight:900,color:"#0f1e3d",marginBottom:20}}>🔔 Add Follow-up</div>
                <div style={{marginBottom:12}}>
                  <label style={labelSt}>Customer</label>
                  <select value={nf.customerId} onChange={e=>setNf(p=>({...p,customerId:e.target.value}))} style={inputSt}>
                    <option value="">Select customer…</option>
                    {customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{marginBottom:12}}>
                  <label style={labelSt}>Service</label>
                  <select value={nf.serviceId} onChange={e=>setNf(p=>({...p,serviceId:e.target.value}))} style={inputSt}>
                    <option value="">Select service…</option>
                    {services.filter(s=>!nf.customerId||s.customerId===nf.customerId).map(s=><option key={s.id} value={s.id}>{s.service}</option>)}
                  </select>
                </div>
                <div style={{marginBottom:12}}><label style={labelSt}>Next Follow-up Date</label><input type="date" value={nf.nextDate} onChange={e=>setNf(p=>({...p,nextDate:e.target.value}))} style={inputSt}/></div>
                <div style={{marginBottom:12}}><label style={labelSt}>Notes</label><textarea value={nf.notes} onChange={e=>setNf(p=>({...p,notes:e.target.value}))} style={{...inputSt,height:70,resize:"vertical"}}/></div>
                <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                  <button onClick={()=>setModal(null)} style={btnGhost}>Cancel</button>
                  <button onClick={addFollowup} style={btnPrimary}>Add Follow-up</button>
                </div>
              </>
            )}

            {modal==="manageServiceTypes"&&(
              <>
                <div style={{fontSize:17,fontWeight:900,color:"#0f1e3d",marginBottom:6}}>⚙️ Manage Service Types</div>
                <div style={{fontSize:12.5,color:"#8fa0b8",marginBottom:18}}>Add, rename, or remove government service types.</div>

                {/* Add new */}
                <div style={{display:"flex",gap:8,marginBottom:18}}>
                  <input
                    value={newServiceTypeName}
                    onChange={e=>setNewServiceTypeName(e.target.value)}
                    onKeyDown={e=>{
                      if(e.key==="Enter"&&newServiceTypeName.trim()&&!serviceTypes.includes(newServiceTypeName.trim())){
                        setServiceTypes(p=>[...p,newServiceTypeName.trim()]);
                        setNewServiceTypeName("");
                      }
                    }}
                    placeholder="New service name…"
                    style={{...inputSt,flex:1}}
                  />
                  <button onClick={()=>{
                    const t=newServiceTypeName.trim();
                    if(t&&!serviceTypes.includes(t)){
                      setServiceTypes(p=>[...p,t]);
                      setNewServiceTypeName("");
                    }
                  }} style={{...btnPrimary,whiteSpace:"nowrap"}}>+ Add</button>
                </div>

                {/* List */}
                <div style={{maxHeight:340,overflowY:"auto",border:"1.5px solid #dbe4f0",borderRadius:10,overflow:"hidden"}}>
                  {serviceTypes.map((svc,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:"1px solid #f0f4fa",background:editingServiceType?.index===i?"#f0f7ff":"#fff"}}>
                      {editingServiceType?.index===i ? (
                        <>
                          <input
                            autoFocus
                            value={editingServiceType.value}
                            onChange={e=>setEditingServiceType(p=>({...p,value:e.target.value}))}
                            onKeyDown={e=>{
                              if(e.key==="Enter"){
                                const v=editingServiceType.value.trim();
                                if(v){
                                  setServiceTypes(p=>p.map((s,idx)=>idx===i?v:s));
                                  setServices(prev=>prev.map(s=>s.service===svc?{...s,service:v}:s));
                                }
                                setEditingServiceType(null);
                              }
                              if(e.key==="Escape") setEditingServiceType(null);
                            }}
                            style={{...inputSt,flex:1,padding:"6px 10px",fontSize:13}}
                          />
                          <button onClick={()=>{
                            const v=editingServiceType.value.trim();
                            if(v){
                              setServiceTypes(p=>p.map((s,idx)=>idx===i?v:s));
                              setServices(prev=>prev.map(s=>s.service===svc?{...s,service:v}:s));
                            }
                            setEditingServiceType(null);
                          }} style={{...btnPrimary,padding:"5px 12px",fontSize:12}}>Save</button>
                          <button onClick={()=>setEditingServiceType(null)} style={{...btnGhost,padding:"5px 10px",fontSize:12}}>✕</button>
                        </>
                      ) : (
                        <>
                          <span style={{flex:1,fontSize:13.5,fontWeight:600,color:"#0f1e3d"}}>{svc}</span>
                          <span style={{fontSize:11,color:"#8fa0b8",marginRight:4}}>
                            {services.filter(s=>s.service===svc).length} apps
                          </span>
                          <button onClick={()=>setEditingServiceType({index:i,value:svc})}
                            style={{background:"#eff6ff",color:"#2563eb",border:"none",borderRadius:6,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>✏️ Edit</button>
                          <button onClick={()=>{
                            if(services.some(s=>s.service===svc)){
                              alert(`Cannot remove "${svc}" — it is used in ${services.filter(s=>s.service===svc).length} application(s). Update those first.`);
                              return;
                            }
                            if(window.confirm(`Remove "${svc}"?`)) setServiceTypes(p=>p.filter((_,idx)=>idx!==i));
                          }}
                            style={{background:"#fef2f2",color:"#dc2626",border:"none",borderRadius:6,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>🗑</button>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{display:"flex",justifyContent:"flex-end",marginTop:18}}>
                  <button onClick={()=>{setModal(null);setEditingServiceType(null);setNewServiceTypeName("");}} style={btnPrimary}>Done</button>
                </div>
              </>
            )}

            {modal==="addStaff"&&(
              <>
                <div style={{fontSize:17,fontWeight:900,color:"#0f1e3d",marginBottom:20}}>👤 Add Staff</div>
                {[["Full Name","name","text"],["Mobile","mobile","tel"],["Username","username","text"]].map(([l,k,t])=>(
                  <div key={k} style={{marginBottom:12}}><label style={labelSt}>{l}</label><input type={t} value={nst[k]} onChange={e=>setNst(p=>({...p,[k]:e.target.value}))} style={inputSt}/></div>
                ))}
                <div style={{marginBottom:12}}>
                  <label style={labelSt}>Role</label>
                  <select value={nst.role} onChange={e=>setNst(p=>({...p,role:e.target.value}))} style={inputSt}>
                    {["Admin","Operator","Receptionist"].map(r=><option key={r}>{r}</option>)}
                  </select>
                </div>
                <div style={{display:"flex",gap:10,marginTop:20,justifyContent:"flex-end"}}>
                  <button onClick={()=>setModal(null)} style={btnGhost}>Cancel</button>
                  <button onClick={addStaff} style={btnPrimary}>Add Staff</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receipt&&<ReceiptModal payment={receipt} onClose={()=>setReceipt(null)}/>}
    </div>
  );
}
