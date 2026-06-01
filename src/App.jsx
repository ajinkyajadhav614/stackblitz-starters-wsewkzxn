import { useState, useEffect, useMemo } from "react";

const LS = {
  get: function(k,d){ try{ var v=localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch(e){ return d; } },
  set: function(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
};

var TODAY = "2026-06-01";
function fmt(n){ return "Rs."+Number(n).toLocaleString("en-IN"); }
var MODES = ["Cash","UPI","Bank Transfer","Card"];
var SVCLIST = ["Aadhaar Card","PAN Card","Shop Act License","Food License","Gazette Name Change","Income Certificate","Caste Certificate","Domicile Certificate","Passport Application","PM Kisan","PMAY","EWS Certificate","Voter ID","Ayushman Card"];
var DEFSTAGES = {
  "PAN Card":["Pending","Documents Collected","Submitted to Govt","E-PAN Generated","Delivered","Rejected","On Hold"],
  "Aadhaar Card":["Pending","Documents Collected","Submitted to Govt","Biometrics Done","Under Process","Aadhaar Generated","Delivered","Rejected"],
  "Passport Application":["Pending","Documents Collected","Application Submitted","Police Verification","Under Process","Passport Generated","Delivered","Rejected"],
  "Shop Act License":["Pending","Documents Collected","Application Submitted","Under Scrutiny","Approved","License Issued","Rejected"],
  "Food License":["Pending","Documents Collected","Application Submitted","Inspection Done","Approved","License Issued","Rejected"],
  "Income Certificate":["Pending","Documents Collected","Submitted to Tehsil","Under Verification","Approved","Certificate Ready","Delivered","Rejected"],
  "Caste Certificate":["Pending","Documents Collected","Submitted to Tehsil","Under Verification","Approved","Certificate Ready","Delivered","Rejected"],
  "Voter ID":["Pending","Documents Collected","Form Submitted","Verification Done","Voter ID Generated","Delivered","Rejected"],
  "Ayushman Card":["Pending","Documents Collected","Eligibility Verified","Application Submitted","Card Generated","Delivered","Rejected"]
};
var DEF_SVC_DOCS = {
  "PAN Card":             ["Acknowledgement","E-PAN Copy","Physical PAN Card","Government Receipt"],
  "Aadhaar Card":         ["Acknowledgement","Aadhaar Card Copy","Biometrics Receipt","Government Receipt"],
  "Passport Application": ["Acknowledgement","Police Verification Letter","Passport Copy","Government Receipt"],
  "Shop Act License":     ["Acknowledgement","License Copy","Inspection Report","Government Receipt"],
  "Food License":         ["Acknowledgement","Inspection Report","License Copy","Government Receipt"],
  "Gazette Name Change":  ["Affidavit Copy","Gazette Copy","Acknowledgement","Government Receipt"],
  "Income Certificate":   ["Acknowledgement","Certificate Copy","Government Receipt"],
  "Caste Certificate":    ["Acknowledgement","Certificate Copy","Government Receipt"],
  "Domicile Certificate": ["Acknowledgement","Certificate Copy","Government Receipt"],
  "Voter ID":             ["Acknowledgement","Voter ID Copy","Government Receipt"],
  "Ayushman Card":        ["Acknowledgement","Ayushman Card Copy","Eligibility Letter","Government Receipt"],
  "PM Kisan":             ["Acknowledgement","Registration Slip","Government Receipt"],
  "PMAY":                 ["Acknowledgement","Survey Report","Approval Letter","Government Receipt"],
  "EWS Certificate":      ["Acknowledgement","Certificate Copy","Government Receipt"]
};
var COLORS = [
  {c:"#3b82f6",bg:"#eff6ff"},{c:"#f59e0b",bg:"#fffbeb"},{c:"#8b5cf6",bg:"#f5f3ff"},
  {c:"#0ea5e9",bg:"#f0f9ff"},{c:"#10b981",bg:"#ecfdf5"},{c:"#16a34a",bg:"#dcfce7"},
  {c:"#ef4444",bg:"#fef2f2"},{c:"#f97316",bg:"#fff7ed"},{c:"#6366f1",bg:"#eef2ff"},
  {c:"#64748b",bg:"#f1f5f9"}
];

function getStages(svc, custom){
  if(custom && custom[svc] && custom[svc].length) return custom[svc];
  if(DEFSTAGES[svc]) return DEFSTAGES[svc];
  return ["Pending","In Process","Completed","Rejected"];
}
function getStageMeta(status, stages){
  var idx = stages ? stages.indexOf(status) : -1;
  return COLORS[idx >= 0 ? idx % COLORS.length : 0] || COLORS[0];
}

var inp = {width:"100%",padding:"9px 12px",borderRadius:8,border:"1.5px solid #dbe4f0",fontSize:13,outline:"none",fontFamily:"inherit",background:"#f7faff",boxSizing:"border-box",color:"#1a2942"};
var lbl = {fontSize:10,fontWeight:600,color:"#9fb0c8",textTransform:"uppercase",letterSpacing:".06em",marginBottom:3,display:"block"};
var btnP = {background:"linear-gradient(135deg,#1e40af,#2563eb)",color:"#fff",border:"none",borderRadius:9,padding:"9px 18px",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"};
var btnO = {background:"linear-gradient(135deg,#ea580c,#f97316)",color:"#fff",border:"none",borderRadius:9,padding:"9px 18px",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"};
var btnG = {background:"#f0f4fa",color:"#374151",border:"none",borderRadius:9,padding:"9px 18px",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"};
var NAV = [
  {k:"dashboard", l:"Dashboard",  ic:"D", bg:"#3b82f6"},
  {k:"customers", l:"Customers",  ic:"C", bg:"#10b981"},
  {k:"services",  l:"Services",   ic:"S", bg:"#f59e0b"},
  {k:"active",    l:"Active Work", ic:"A", bg:"#e11d48"},
  {k:"payments",  l:"Payments",   ic:"P", bg:"#8b5cf6"},
  {k:"documents", l:"Documents",  ic:"F", bg:"#0ea5e9"},
  {k:"followups", l:"Follow-ups", ic:"R", bg:"#ef4444"},
  {k:"reports",   l:"Reports",    ic:"G", bg:"#f97316"},
  {k:"staff",     l:"Staff",      ic:"T", bg:"#ec4899"},
  {k:"kiosk",     l:"Kiosk",      ic:"K", bg:"#14b8a6"},
  {k:"settings",  l:"Settings",   ic:"X", bg:"#6366f1"}
];

var seedC = [
  {id:"C001",name:"Ramesh Patil",mobile:"9876543210",email:"ramesh@gmail.com",address:"Gandhi Chaman Old Jalna",dateAdded:TODAY,notes:""},
  {id:"C002",name:"Sunita Deshpande",mobile:"9823456781",email:"sunita@yahoo.com",address:"Ambad Road, Jalna",dateAdded:TODAY,notes:""},
  {id:"C003",name:"Vijay Khamkar",mobile:"9712345678",email:"vijay@gmail.com",address:"Station Road, Jalna",dateAdded:TODAY,notes:""}
];
var seedS = [
  {id:"S001",cid:"C001",cname:"Ramesh Patil",svc:"PAN Card",appNo:"PAN001",date:TODAY,status:"Delivered",remarks:""},
  {id:"S002",cid:"C002",cname:"Sunita Deshpande",svc:"Aadhaar Card",appNo:"ADH001",date:TODAY,status:"Under Process",remarks:""},
  {id:"S003",cid:"C003",cname:"Vijay Khamkar",svc:"Passport Application",appNo:"PASS001",date:TODAY,status:"Pending",remarks:""}
];
var seedP = [
  {id:"P001",cid:"C001",cname:"Ramesh Patil",sid:"S001",svc:"PAN Card",total:500,recv:500,pend:0,date:TODAY,mode:"UPI"},
  {id:"P002",cid:"C003",cname:"Vijay Khamkar",sid:"S003",svc:"Passport Application",total:1500,recv:750,pend:750,date:TODAY,mode:"Cash"}
];
var seedI = [
  {id:"I001",pid:"P001",cid:"C001",cname:"Ramesh Patil",svc:"PAN Card",amt:500,mode:"UPI",date:TODAY,time:"10:30",note:"Full"},
  {id:"I002",pid:"P002",cid:"C003",cname:"Vijay Khamkar",svc:"Passport Application",amt:750,mode:"Cash",date:TODAY,time:"11:00",note:"Advance"}
];

function Av(props){
  var name = props.name || "?";
  var size = props.size || 34;
  var h = 0;
  for(var ci=0; ci<name.length; ci++){ h += name.charCodeAt(ci); }
  h = h % 360;
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:"hsl("+h+",55%,52%)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:size*0.35,flexShrink:0}}>
      {name.split(" ").map(function(x){ return x[0]; }).slice(0,2).join("")}
    </div>
  );
}

function Badge(props){
  var m = getStageMeta(props.status, getStages(props.svc||"", props.custom));
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:999,fontSize:11,fontWeight:600,background:m.bg,color:m.c,whiteSpace:"nowrap",border:"1px solid "+m.c+"33"}}>
      <span style={{width:5,height:5,borderRadius:"50%",background:m.c,flexShrink:0}}></span>
      {props.status||"-"}
    </span>
  );
}

function KPI(props){
  return (
    <div style={{background:"#fff",borderRadius:14,padding:"16px 20px",border:"1.5px solid #eef2f7",borderTop:"3px solid "+props.color,boxShadow:"0 2px 8px rgba(0,30,80,.04)"}}>
      <div style={{fontSize:10,fontWeight:600,color:"#9fb0c8",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>{props.label}</div>
      <div style={{fontSize:22,fontWeight:700,color:"#1a2942",filter:props.blur?"blur(8px)":"none",transition:"filter .2s"}}>{props.value}</div>
      {props.sub && <div style={{fontSize:11,color:"#a0b0c8",marginTop:4}}>{props.sub}</div>}
    </div>
  );
}

function CPick(props){
  const [q,setQ] = useState("");
  const [open,setOpen] = useState(false);
  var list = q ? props.custs.filter(function(c){ return c.name.toLowerCase().indexOf(q.toLowerCase())>=0||c.mobile.indexOf(q)>=0; }) : props.custs.slice().reverse().slice(0,6);
  return (
    <div style={{position:"relative"}}>
      <input value={q} onChange={function(e){ setQ(e.target.value); setOpen(true); }} onFocus={function(){ setOpen(true); }} placeholder="Search customer..." style={inp} />
      {open && (
        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:"#fff",border:"1.5px solid #dbe4f0",borderRadius:10,boxShadow:"0 8px 24px rgba(0,30,80,.12)",zIndex:9999,maxHeight:220,overflowY:"auto"}}>
          {list.length===0 && <div style={{padding:"12px 14px",fontSize:13,color:"#8fa0b8"}}>No customers found</div>}
          {list.map(function(c){
            return (
              <div key={c.id} onMouseDown={function(e){ e.preventDefault(); props.onSelect(c); setQ(c.name); setOpen(false); }} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer",borderBottom:"1px solid #f5f8ff"}}>
                <Av name={c.name} size={28} />
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:"#1a2942"}}>{c.name}</div>
                  <div style={{fontSize:11,color:"#8fa0b8"}}>{c.mobile}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function App(){
  const [tab,setTab] = useState("dashboard");
  const [custs,setCusts] = useState(function(){ return LS.get("ash_c",seedC); });
  const [svcs,setSvcs] = useState(function(){ return LS.get("ash_s",seedS); });
  const [pays,setPays] = useState(function(){ return LS.get("ash_p",seedP); });
  const [insts,setInsts] = useState(function(){ return LS.get("ash_i",seedI); });
  const [docs,setDocs] = useState(function(){ return LS.get("ash_d",[]); });
  const [staff,setStaff] = useState(function(){ return LS.get("ash_st",[{id:"E001",name:"Suresh Kulkarni",mobile:"9811223344",role:"Admin",username:"suresh",active:true}]); });
  const [svcTypes,setSvcTypes] = useState(function(){ return LS.get("ash_t",SVCLIST); });
  const [custom,setCustom] = useState(function(){ return LS.get("ash_cs",{}); });
  const [docTypes,setDocTypes] = useState(function(){ return LS.get("ash_dt",["Government Receipt","Acknowledgement","Ready Document","ID Proof","Other"]); });
  const [svcDocTypes,setSvcDocTypes] = useState(function(){ return LS.get("ash_sdt",{}); });
  const [modal,setModal] = useState(null);
  const [notify,setNotify] = useState(null);
  const [receipt,setReceipt] = useState(null);
  const [instM,setInstM] = useState(null);
  const [stageEd,setStageEd] = useState(null);
  const [selC,setSelC] = useState(null);
  const [search,setSearch] = useState("");
  const [docF,setDocF] = useState("All");
  const [showDM,setShowDM] = useState(false);
  const [newDT,setNewDT] = useState("");
  const [editDT,setEditDT] = useState(null);
  const [newST,setNewST] = useState("");
  const [editST,setEditST] = useState(null);
  const [shareM,setShareM] = useState(null);
  const [svcView,setSvcView] = useState("board");
  const [filterSvc,setFilterSvc] = useState("All");
  const [filterStatus,setFilterStatus] = useState("All");
  const [activeFilterSvc,setActiveFilterSvc] = useState("All");
  const [activeFilterStatus,setActiveFilterStatus] = useState("All");
  const [openDocSvc,setOpenDocSvc] = useState(null);
  const [showFin,setShowFin] = useState(false);
  const [payQR,setPayQR] = useState(function(){ return LS.get("ash_qr",""); });
  const [showPayFin,setShowPayFin] = useState(true);
  const [paySearch,setPaySearch] = useState("");
  const [editFees,setEditFees] = useState(null);
  const [payRequests,setPayRequests] = useState(function(){ return LS.get("ash_pr",[]); });
  const [otpStore,setOtpStore] = useState(function(){ return LS.get("ash_otps",{}); });
  const [followups,setFollowups] = useState(function(){ return LS.get("ash_f",[
    {id:"F001",cid:"C003",cname:"Vijay Khamkar",sid:"S003",svc:"Passport Application",due:"2026-06-03",note:"Collect DOB documents",status:"Pending",priority:"High"},
    {id:"F002",cid:"C002",cname:"Sunita Deshpande",sid:"S002",svc:"Aadhaar Card",due:"2026-06-05",note:"Status check with office",status:"Pending",priority:"Normal"}
  ]); });
  const [nf,setNf] = useState({cid:"",cname:"",sid:"",svc:"",due:TODAY,note:"",priority:"Normal"});
  const [km,setKm] = useState("");
  const [kmatches,setKmatches] = useState([]);
  const [kotpInput,setKotpInput] = useState("");
  const [kotpError,setKotpError] = useState("");
  const [kp,setKp] = useState("");
  const [kstep,setKstep] = useState("login");
  const [knp,setKnp] = useState("");
  const [kcp,setKcp] = useState("");
  const [kcust,setKcust] = useState(null);
  const [nc,setNc] = useState({name:"",mob:"",email:"",svcList:[]});
  const [ns,setNs] = useState({cid:"",cname:"",date:TODAY,svcList:[{svc:SVCLIST[0],appNo:"",status:"Pending",fees:"",recv:"",mode:"Cash"}]});
  const [np,setNp] = useState({cid:"",cname:"",sid:"",fees:"",recv:"",date:TODAY,mode:"Cash"});
  const [ni,setNi] = useState({amt:"",mode:"Cash",date:TODAY,note:""});
  const [ndoc,setNdoc] = useState({cid:"",cname:"",sid:"",svc:"",type:"Government Receipt",fileName:"",driveLink:"",note:""});
  const [nstaff,setNstaff] = useState({name:"",mobile:"",role:"Operator",username:""});

  useEffect(function(){ LS.set("ash_c",custs); },[custs]);
  useEffect(function(){ LS.set("ash_s",svcs); },[svcs]);
  useEffect(function(){ LS.set("ash_p",pays); },[pays]);
  useEffect(function(){ LS.set("ash_i",insts); },[insts]);
  useEffect(function(){ LS.set("ash_d",docs); },[docs]);
  useEffect(function(){ LS.set("ash_f",followups); },[followups]);
  useEffect(function(){ LS.set("ash_st",staff); },[staff]);
  useEffect(function(){ LS.set("ash_t",svcTypes); },[svcTypes]);
  useEffect(function(){ LS.set("ash_cs",custom); },[custom]);
  useEffect(function(){ LS.set("ash_dt",docTypes); },[docTypes]);
  useEffect(function(){ LS.set("ash_pr",payRequests); },[payRequests]);
  useEffect(function(){ LS.set("ash_qr",payQR); },[payQR]);
  useEffect(function(){ LS.set("ash_otps",otpStore); },[otpStore]);
  useEffect(function(){ LS.set("ash_sdt",svcDocTypes); },[svcDocTypes]);

  const totalRev = insts.reduce(function(s,i){ return s+i.amt; },0);
  const totalPend = pays.reduce(function(s,p){ return s+p.pend; },0);
  const filtC = useMemo(function(){
    return custs.filter(function(c){ return c.name.toLowerCase().indexOf(search.toLowerCase())>=0||c.mobile.indexOf(search)>=0; });
  },[custs,search]);

  var addCust=function(){
    if(!nc.name||!nc.mob) return;
    var id="C"+String(custs.length+1).padStart(3,"0");
    setCusts(function(p){ return p.concat([{id:id,name:nc.name,mobile:nc.mob,email:nc.email,address:"",dateAdded:TODAY,notes:""}]); });
    var newSvcs=[]; var newPays=[]; var newInsts=[];
    var svcCount=svcs.length; var payCount=pays.length; var instCount=insts.length;
    (nc.svcList||[]).forEach(function(item){
      if(!item.svc) return;
      var sid="S"+String(svcCount+1).padStart(3,"0"); svcCount++;
      newSvcs.push({id:sid,cid:id,cname:nc.name,svc:item.svc,appNo:item.appNo||"",date:TODAY,status:item.status||"Pending",remarks:""});
      if(item.fees){
        var t=Number(item.fees),r=Number(item.recv)||0;
        var pid="P"+String(payCount+1).padStart(3,"0"); payCount++;
        newPays.push({id:pid,cid:id,cname:nc.name,sid:sid,svc:item.svc,total:t,recv:r,pend:t-r,date:TODAY,mode:item.mode||"Cash"});
        if(r>0){
          var now=new Date(); var tm=String(now.getHours()).padStart(2,"0")+":"+String(now.getMinutes()).padStart(2,"0");
          newInsts.push({id:"I"+String(instCount+1).padStart(3,"0"),pid:pid,cid:id,cname:nc.name,svc:item.svc,amt:r,mode:item.mode||"Cash",date:TODAY,time:tm,note:"Initial"});
          instCount++;
        }
      }
    });
    if(newSvcs.length) setSvcs(function(p){ return p.concat(newSvcs); });
    if(newPays.length) setPays(function(p){ return p.concat(newPays); });
    if(newInsts.length) setInsts(function(p){ return p.concat(newInsts); });
    setShareM({name:nc.name,mob:nc.mob});
    setNc({name:"",mob:"",email:"",svcList:[]});
    setModal(null);
  };
  var addSvc=function(){
    if(!ns.cid||!ns.svcList.length) return;
    var newSvcs=[]; var newPays=[]; var newInsts=[];
    var svcCount=svcs.length; var payCount=pays.length; var instCount=insts.length;
    ns.svcList.forEach(function(item){
      if(!item.svc) return;
      var sid="S"+String(svcCount+1).padStart(3,"0"); svcCount++;
      newSvcs.push({id:sid,cid:ns.cid,cname:ns.cname,svc:item.svc,appNo:item.appNo,date:ns.date,status:item.status,remarks:""});
      if(item.fees){
        var t=Number(item.fees),r=Number(item.recv)||0;
        var pid="P"+String(payCount+1).padStart(3,"0"); payCount++;
        newPays.push({id:pid,cid:ns.cid,cname:ns.cname,sid:sid,svc:item.svc,total:t,recv:r,pend:t-r,date:ns.date,mode:item.mode});
        if(r>0){
          var now=new Date(); var tm=String(now.getHours()).padStart(2,"0")+":"+String(now.getMinutes()).padStart(2,"0");
          newInsts.push({id:"I"+String(instCount+1).padStart(3,"0"),pid:pid,cid:ns.cid,cname:ns.cname,svc:item.svc,amt:r,mode:item.mode,date:ns.date,time:tm,note:"Initial payment"});
          instCount++;
        }
      }
    });
    setSvcs(function(p){ return p.concat(newSvcs); });
    setPays(function(p){ return p.concat(newPays); });
    setInsts(function(p){ return p.concat(newInsts); });
    setNs({cid:"",cname:"",date:TODAY,svcList:[{svc:SVCLIST[0],appNo:"",status:"Pending",fees:"",recv:"",mode:"Cash"}]});
    setModal(null);
  };
  var addPay=function(){
    if(!np.cid||!np.fees) return;
    var ep=pays.find(function(p){ return p.sid===np.sid; });
    if(ep&&np.recv){
      var a=Number(np.recv);
      setPays(function(p){ return p.map(function(pm){ return pm.id===ep.id?Object.assign({},pm,{recv:pm.recv+a,pend:pm.pend-a}):pm; }); });
      setInsts(function(p){ return p.concat([{id:"I"+String(insts.length+1).padStart(3,"0"),pid:ep.id,cid:ep.cid,cname:ep.cname,svc:ep.svc,amt:a,mode:np.mode,date:np.date,time:(function(){ var n=new Date(); return String(n.getHours()).padStart(2,"0")+":"+String(n.getMinutes()).padStart(2,"0"); })(),note:""}]); });
    } else if(!ep){
      var t=Number(np.fees),r=Number(np.recv)||0;
      var sv=svcs.find(function(s){ return s.id===np.sid; });
      var pid="P"+String(pays.length+1).padStart(3,"0");
      setPays(function(p){ return p.concat([{id:pid,cid:np.cid,cname:np.cname,sid:np.sid,svc:sv?sv.svc:"",total:t,recv:r,pend:t-r,date:np.date,mode:np.mode}]); });
      if(r>0){ setInsts(function(p){ return p.concat([{id:"I"+String(insts.length+1).padStart(3,"0"),pid:pid,cid:np.cid,cname:np.cname,svc:sv?sv.svc:"",amt:r,mode:np.mode,date:np.date,time:(function(){ var n=new Date(); return String(n.getHours()).padStart(2,"0")+":"+String(n.getMinutes()).padStart(2,"0"); })(),note:"Initial"}]); }); }
    }
    setNp({cid:"",cname:"",sid:"",fees:"",recv:"",date:TODAY,mode:"Cash"});
    setModal(null);
  };
  var addInst=function(){
    var pay=pays.find(function(p){ return p.id===instM; });
    if(!pay||!ni.amt) return;
    var a=Number(ni.amt);
    if(a>pay.pend){ alert("Max: "+fmt(pay.pend)); return; }
    setPays(function(p){ return p.map(function(pm){ return pm.id===pay.id?Object.assign({},pm,{recv:pm.recv+a,pend:pm.pend-a}):pm; }); });
    setInsts(function(p){ return p.concat([{id:"I"+String(insts.length+1).padStart(3,"0"),pid:pay.id,cid:pay.cid,cname:pay.cname,svc:pay.svc,amt:a,mode:ni.mode,date:ni.date,time:(function(){ var n=new Date(); return String(n.getHours()).padStart(2,"0")+":"+String(n.getMinutes()).padStart(2,"0"); })(),note:ni.note}]); });
    setNi({amt:"",mode:"Cash",date:TODAY,note:""});
    setInstM(null);
  };
  var updStatus=function(id,status){
    var svc=svcs.find(function(s){ return s.id===id; });
    if(!svc) return;
    var c=custs.find(function(c){ return c.id===svc.cid; });
    setSvcs(function(p){ return p.map(function(s){ return s.id===id?Object.assign({},s,{status:status}):s; }); });
    setNotify({svc:Object.assign({},svc,{status:status}),cust:{id:svc.cid||"",name:c?c.name:svc.cname||"Customer",mobile:c?c.mobile:"",email:c?c.email:""}});
  };

  return (
    <div style={{display:"flex",height:"100vh",fontFamily:"Nunito,Segoe UI,sans-serif",background:"#f0f4fa",overflow:"hidden"}}>

      <div style={{width:210,background:"linear-gradient(160deg,#0a1628,#0f1e3d,#1a3260)",display:"flex",flexDirection:"column",padding:"0 0 16px",flexShrink:0,boxShadow:"3px 0 16px rgba(0,0,0,.18)"}}>
        <div style={{padding:"20px 16px 16px",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:38,height:38,borderRadius:12,background:"linear-gradient(135deg,#f97316,#ea580c)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900,color:"#fff"}}>A</div>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>Ashirwad</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,.4)",letterSpacing:".05em"}}>MULTISERVICES</div>
            </div>
          </div>
        </div>
        <nav style={{padding:"10px 8px",flex:1}}>
          {NAV.map(function(n){
            var act=tab===n.k;
            return (
              <button key={n.k} onClick={function(){ setTab(n.k); }} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"8px 10px",borderRadius:9,border:"none",cursor:"pointer",background:act?"rgba(255,255,255,.12)":"transparent",fontWeight:act?700:400,fontSize:13,fontFamily:"inherit",marginBottom:2,textAlign:"left",transition:"all .15s"}}>
                <div style={{width:28,height:28,borderRadius:8,background:act?n.bg:n.bg+"33",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s",boxShadow:act?"0 2px 8px "+n.bg+"66":"none"}}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={act?"#fff":n.bg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {n.k==="dashboard"&&<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10"/>}
                    {n.k==="customers"&&<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75"/>}
                    {n.k==="services"&&<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8"/>}
                    {n.k==="active"&&<path d="M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>}
                    {n.k==="payments"&&<path d="M21 4H3a2 2 0 00-2 2v12a2 2 0 002 2h18a2 2 0 002-2V6a2 2 0 00-2-2z M1 10h22"/>}
                    {n.k==="documents"&&<path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z M13 2v7h7"/>}
                    {n.k==="followups"&&<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0"/>}
                    {n.k==="reports"&&<path d="M18 20V10 M12 20V4 M6 20v-6"/>}
                    {n.k==="staff"&&<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8"/>}
                    {n.k==="kiosk"&&<path d="M20 3H4a1 1 0 00-1 1v12a1 1 0 001 1h16a1 1 0 001-1V4a1 1 0 00-1-1z M8 21h8 M12 17v4"/>}
                    {n.k==="settings"&&<path d="M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>}
                  </svg>
                </div>
                <span style={{flex:1,color:act?"#fff":"rgba(255,255,255,.6)"}}>{n.l}</span>
                {n.k==="payments"&&(function(){
                  var cnt=payRequests.filter(function(r){ return r.status==="Pending"; }).length;
                  return cnt>0?<span style={{background:"#8b5cf6",color:"#fff",borderRadius:999,padding:"1px 7px",fontSize:10,fontWeight:800}}>{cnt}</span>:null;
                })()}
                {n.k==="active"&&(function(){
                  var doneWords=["delivered","completed","done","rejected","issued","generated","dispatched"];
                  var cnt=svcs.filter(function(s){ var st=s.status.toLowerCase(); return !doneWords.some(function(w){ return st.indexOf(w)>=0; }); }).length;
                  return cnt>0?<span style={{background:"#e11d48",color:"#fff",borderRadius:999,padding:"1px 7px",fontSize:10,fontWeight:800}}>{cnt}</span>:null;
                })()}
                {n.k==="followups"&&(function(){
                  var cnt=followups.filter(function(f){ return f.status==="Pending"&&f.due<=TODAY; }).length;
                  return cnt>0?<span style={{background:"#ef4444",color:"#fff",borderRadius:999,padding:"1px 7px",fontSize:10,fontWeight:800}}>{cnt}</span>:null;
                })()}
                {n.k==="customers"&&(function(){
                  var count=custs.filter(function(c){ return otpStore[c.mobile+"_"+c.id]; }).length;
                  return count>0?<span style={{background:"#f97316",color:"#fff",borderRadius:999,padding:"1px 7px",fontSize:10,fontWeight:800}}>{count}</span>:null;
                })()}
              </button>
            );
          })}
        </nav>
        <div style={{padding:"10px 14px",borderTop:"1px solid rgba(255,255,255,.08)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#f97316,#fbbf24)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:"#fff",flexShrink:0}}>SA</div>
            <div><div style={{fontSize:12,fontWeight:700,color:"#fff"}}>Super Admin</div><div style={{fontSize:10,color:"rgba(255,255,255,.4)"}}>Full Access</div></div>
          </div>
        </div>
      </div>

      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{background:"#fff",borderBottom:"2px solid #e8eef8",padding:"13px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div>
            <div style={{fontSize:17,fontWeight:700,color:"#1a2942"}}>{(NAV.find(function(n){ return n.k===tab; })||{}).l||""}</div>
            <div style={{fontSize:11,color:"#8fa0b8"}}>Ashirwad Multiservices - Jalna - {TODAY}</div>
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:5,background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,padding:"4px 10px"}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:"#16a34a"}}></div>
              <span style={{fontSize:11,fontWeight:700,color:"#16a34a"}}>Auto-saved</span>
            </div>
            {tab==="customers"&&<button onClick={function(){ setModal("cust"); }} style={btnP}>+ Customer</button>}
            {tab==="services"&&<button onClick={function(){ setModal("svc"); }} style={btnP}>+ Application</button>}
            {tab==="payments"&&<button onClick={function(){ setModal("pay"); }} style={btnP}>+ Payment</button>}
            {tab==="documents"&&<button onClick={function(){ setModal("doc"); }} style={btnP}>+ Document</button>}
            {tab==="staff"&&<button onClick={function(){ setModal("staff"); }} style={btnP}>+ Staff</button>}
            {tab==="followups"&&<button onClick={function(){ setModal("followup"); }} style={btnP}>+ Follow-up</button>}
          </div>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"22px 24px"}}>

          {tab==="dashboard"&&(
            <div>
              <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
                <button onClick={function(){ setShowFin(function(x){ return !x; }); }} style={{...btnG,padding:"6px 16px",fontSize:12}}>{showFin?"Hide Amounts":"Show Amounts"}</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:18}}>
                <KPI label="Total Revenue" value={fmt(totalRev)} sub="All collected" color="#2563eb" blur={!showFin} />
                <KPI label="Pending Balance" value={fmt(totalPend)} sub="Outstanding" color="#ef4444" blur={!showFin} />
                <KPI label="Customers" value={custs.length} sub={svcs.length+" applications"} color="#10b981" />
                <KPI label="Completed" value={svcs.filter(function(s){ return s.status==="Completed"||s.status==="Delivered"; }).length} sub="Done" color="#16a34a" />
              </div>
              <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #dbe4f0",padding:"18px 22px",marginBottom:18}}>
                <div style={{fontSize:14,fontWeight:700,color:"#1a2942",marginBottom:14}}>Service-wise Status</div>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr style={{background:"#f8faff"}}>{["Service","Total","Pending","In Process","Completed","Rejected"].map(function(h){ return <th key={h} style={{padding:"8px 12px",textAlign:h==="Service"?"left":"center",fontSize:10,fontWeight:600,color:"#9fb0c8",textTransform:"uppercase",borderBottom:"1px solid #f0f4fa"}}>{h}</th>; })}</tr></thead>
                  <tbody>
                    {svcTypes.map(function(sv){
                      var sa=svcs.filter(function(s){ return s.svc===sv; });
                      if(!sa.length) return null;
                      var stgs=getStages(sv,custom);
                      var pend=sa.filter(function(s){ return s.status===stgs[0]; }).length;
                      var done=sa.filter(function(s){ return s.status==="Completed"||s.status==="Delivered"||s.status===stgs[stgs.length-1]; }).length;
                      var rej=sa.filter(function(s){ return s.status==="Rejected"; }).length;
                      var inp2=sa.length-pend-done-rej;
                      return (
                        <tr key={sv} style={{borderBottom:"1px solid #f5f8ff"}}>
                          <td style={{padding:"9px 12px",fontSize:13,fontWeight:600,color:"#1a2942"}}>{sv}</td>
                          <td style={{padding:"9px 12px",textAlign:"center",fontSize:13,fontWeight:700}}>{sa.length}</td>
                          <td style={{padding:"9px 12px",textAlign:"center"}}>{pend>0?<span style={{padding:"2px 8px",borderRadius:999,background:"#fffbeb",color:"#92400e",fontSize:12,fontWeight:600}}>{pend}</span>:<span style={{color:"#d1d5db"}}>-</span>}</td>
                          <td style={{padding:"9px 12px",textAlign:"center"}}>{inp2>0?<span style={{padding:"2px 8px",borderRadius:999,background:"#eff6ff",color:"#2563eb",fontSize:12,fontWeight:600}}>{inp2}</span>:<span style={{color:"#d1d5db"}}>-</span>}</td>
                          <td style={{padding:"9px 12px",textAlign:"center"}}>{done>0?<span style={{padding:"2px 8px",borderRadius:999,background:"#dcfce7",color:"#16a34a",fontSize:12,fontWeight:600}}>{done}</span>:<span style={{color:"#d1d5db"}}>-</span>}</td>
                          <td style={{padding:"9px 12px",textAlign:"center"}}>{rej>0?<span style={{padding:"2px 8px",borderRadius:999,background:"#fee2e2",color:"#dc2626",fontSize:12,fontWeight:600}}>{rej}</span>:<span style={{color:"#d1d5db"}}>-</span>}</td>
                        </tr>
                      );
                    }).filter(function(x){ return x; })}
                  </tbody>
                </table>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:18}}>
                <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #dbe4f0",padding:"18px 22px"}}>
                  <div style={{fontSize:14,fontWeight:700,color:"#1a2942",marginBottom:14}}>Recent Applications</div>
                  {svcs.slice(-6).reverse().map(function(s){
                    return (
                      <div key={s.id} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:"1px solid #f5f8ff"}}>
                        <Av name={s.cname} size={30} />
                        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:"#1a2942"}}>{s.cname}</div><div style={{fontSize:11,color:"#8fa0b8"}}>{s.svc}</div></div>
                        <Badge status={s.status} svc={s.svc} custom={custom} />
                      </div>
                    );
                  })}
                </div>
                <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #dbe4f0",padding:"18px 22px"}}>
                  <div style={{fontSize:14,fontWeight:700,color:"#1a2942",marginBottom:14}}>Quick Stats</div>
                  {[["Pending",svcs.filter(function(s){ return s.status==="Pending"; }).length,"#f59e0b"],["In Process",svcs.filter(function(s){ return s.status!=="Pending"&&s.status!=="Completed"&&s.status!=="Delivered"&&s.status!=="Rejected"; }).length,"#2563eb"],["Completed",svcs.filter(function(s){ return s.status==="Completed"||s.status==="Delivered"; }).length,"#16a34a"],["Rejected",svcs.filter(function(s){ return s.status==="Rejected"; }).length,"#ef4444"]].map(function(row){
                    return <div key={row[0]} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #f5f8ff"}}><span style={{fontSize:13,color:"#6b7280",fontWeight:600}}>{row[0]}</span><span style={{fontSize:18,fontWeight:700,color:row[2]}}>{row[1]}</span></div>;
                  })}
                </div>
              </div>
            </div>
          )}

          {tab==="customers"&&(
            <div>
              {/* OTP Requests Banner */}
              {(function(){
                var otpCusts=custs.filter(function(c){ return otpStore[c.mobile+"_"+c.id]; });
                if(!otpCusts.length) return null;
                return (
                  <div style={{background:"#fff7ed",borderRadius:12,border:"2px solid #fed7aa",padding:"12px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                    <div style={{width:34,height:34,borderRadius:9,background:"#f97316",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:"#92400e"}}>{otpCusts.length} PIN Reset OTP Request{otpCusts.length>1?"s":""}</div>
                      <div style={{fontSize:11,color:"#b45309"}}>
                        {otpCusts.map(function(c){ return c.name; }).join(", ")} - click their name below to view OTP
                      </div>
                    </div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {otpCusts.map(function(c){
                        var otp=otpStore[c.mobile+"_"+c.id];
                        return (
                          <div key={c.id} style={{background:"#fff",borderRadius:8,padding:"6px 12px",border:"1.5px solid #fde68a",textAlign:"center"}}>
                            <div style={{fontSize:10,color:"#92400e",fontWeight:600}}>{c.name}</div>
                            <div style={{fontSize:20,fontWeight:900,color:"#f97316",letterSpacing:4}}>{otp}</div>
                            <a href={"https://wa.me/91"+c.mobile+"?text=Your+Ashirwad+PIN+Reset+OTP:+"+otp+"+One+time+use+only."} target="_blank" rel="noreferrer" style={{display:"block",marginTop:4,fontSize:10,fontWeight:700,color:"#16a34a",background:"#dcfce7",padding:"2px 8px",borderRadius:5,textDecoration:"none"}}>Send WA</a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
              <div style={{display:"flex",gap:12,marginBottom:14}}>
                <input value={search} onChange={function(e){ setSearch(e.target.value); }} placeholder="Search customers..." style={{...inp,width:260,background:"#fff"}} />
                <span style={{marginLeft:"auto",fontSize:13,color:"#8fa0b8",display:"flex",alignItems:"center"}}>{filtC.length} customers</span>
              </div>
              <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #dbe4f0",overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr style={{background:"#f5f8ff",borderBottom:"1.5px solid #dbe4f0"}}>{["Customer","Mobile","Email","Services","Pending","Added","WA"].map(function(h){ return <th key={h} style={{padding:"9px 14px",textAlign:"left",fontSize:10,fontWeight:600,color:"#9fb0c8",textTransform:"uppercase"}}>{h}</th>; })}</tr></thead>
                  <tbody>
                    {filtC.map(function(c){
                      var isSel=selC&&selC.id===c.id;
                      var custPend=pays.filter(function(p){ return p.cid===c.id; }).reduce(function(s,p){ return s+p.pend; },0);
                      return (
                        <tr key={c.id} style={{borderBottom:"1px solid #f5f8ff",cursor:"pointer",background:isSel?"#f0f7ff":"transparent"}} onClick={function(){ setSelC(isSel?null:c); }}>
                          <td style={{padding:"10px 14px"}}><div style={{display:"flex",alignItems:"center",gap:10}}><Av name={c.name} size={28} /><div><div style={{fontSize:13,fontWeight:600,color:"#1a2942"}}>{c.name}</div><div style={{fontSize:11,color:"#8fa0b8"}}>{c.id}</div></div></div></td>
                          <td style={{padding:"10px 14px",fontSize:13,fontWeight:600}}>{c.mobile}</td>
                          <td style={{padding:"10px 14px",fontSize:12,color:"#8fa0b8"}}>{c.email||"-"}</td>
                          <td style={{padding:"10px 14px",fontSize:13}}>{svcs.filter(function(s){ return s.cid===c.id; }).length}</td>
                          <td style={{padding:"10px 14px"}}>
                            {custPend>0
                              ? <span style={{fontSize:12,fontWeight:700,color:"#ef4444",background:"#fee2e2",padding:"3px 9px",borderRadius:999}}>{fmt(custPend)}</span>
                              : <span style={{fontSize:11,fontWeight:600,color:"#16a34a",background:"#f0fdf4",padding:"3px 9px",borderRadius:999}}>Cleared</span>
                            }
                          </td>
                          <td style={{padding:"10px 14px",fontSize:12,color:"#8fa0b8"}}>{c.dateAdded}</td>
                          <td style={{padding:"10px 14px"}}><a href={"https://wa.me/91"+c.mobile} target="_blank" rel="noreferrer" style={{background:"#dcfce7",color:"#16a34a",borderRadius:6,padding:"4px 8px",fontSize:11,fontWeight:700,textDecoration:"none"}} onClick={function(e){ e.stopPropagation(); }}>WA</a></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {selC&&(
                <div style={{marginTop:14,background:"#fff",borderRadius:14,border:"1.5px solid #dbe4f0",padding:"18px 22px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                    <Av name={selC.name} size={44} />
                    <div style={{flex:1}}><div style={{fontSize:17,fontWeight:700,color:"#1a2942"}}>{selC.name}</div><div style={{fontSize:12,color:"#8fa0b8"}}>{selC.id} - {selC.mobile}</div></div>
                    <button onClick={function(){
                      var blob=new Blob([""],{type:"text/html"});
                      URL.revokeObjectURL(blob);
                    }} style={{display:"none"}}></button>
                    <a href={"https://wa.me/91"+selC.mobile} target="_blank" rel="noreferrer" style={{...btnG,fontSize:12,textDecoration:"none",padding:"7px 14px"}}>WA</a>
                  </div>

                  {/* OTP Panel - show if customer has a pending OTP reset request */}
                  {(function(){
                    var custIds = custs.filter(function(c){ return c.mobile===selC.mobile; }).map(function(c){ return c.id; });
                    var otpEntries = custIds.map(function(cid){
                      var otp = otpStore[selC.mobile+"_"+cid];
                      return otp ? {cid:cid,otp:otp} : null;
                    }).filter(function(x){ return x; });
                    if(!otpEntries.length) return null;
                    return (
                      <div style={{background:"#fff7ed",borderRadius:10,padding:"12px 14px",marginBottom:14,border:"2px solid #fed7aa"}}>
                        <div style={{fontSize:12,fontWeight:700,color:"#92400e",marginBottom:8}}>PIN Reset OTP Request</div>
                        {otpEntries.map(function(entry){
                          var c = custs.find(function(x){ return x.id===entry.cid; });
                          return (
                            <div key={entry.cid} style={{display:"flex",alignItems:"center",gap:10,background:"#fff",borderRadius:8,padding:"10px 12px",marginBottom:6,border:"1px solid #fde68a"}}>
                              <div style={{flex:1}}>
                                <div style={{fontSize:12,fontWeight:600,color:"#1a2942"}}>{c?c.name:entry.cid}</div>
                                <div style={{fontSize:10,color:"#8fa0b8"}}>Requested PIN reset</div>
                              </div>
                              <div style={{textAlign:"center"}}>
                                <div style={{fontSize:10,color:"#8fa0b8",marginBottom:2}}>OTP</div>
                                <div style={{fontSize:22,fontWeight:900,color:"#f97316",letterSpacing:4}}>{entry.otp}</div>
                              </div>
                              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                                <a href={"https://wa.me/91"+selC.mobile+"?text=Your+Ashirwad+Multiservices+PIN+Reset+OTP+is:+"+entry.otp+"+Valid+for+one+time+use+only."} target="_blank" rel="noreferrer" style={{background:"#dcfce7",color:"#16a34a",borderRadius:6,padding:"4px 8px",fontSize:10,fontWeight:700,textDecoration:"none",textAlign:"center"}}>Send WA</a>
                                <button onClick={function(){ setOtpStore(function(x){ var n=Object.assign({},x); delete n[selC.mobile+"_"+entry.cid]; return n; }); }} style={{background:"#fee2e2",color:"#ef4444",border:"none",borderRadius:6,padding:"4px 8px",fontSize:10,fontWeight:700,cursor:"pointer"}}>Cancel</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                  {svcs.filter(function(s){ return s.cid===selC.id; }).map(function(s){
                    return (
                      <div key={s.id} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:"1px solid #f5f8ff"}}>
                        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:"#1a2942"}}>{s.svc}</div><div style={{fontSize:11,color:"#8fa0b8"}}>{s.appNo||"-"}</div></div>
                        <Badge status={s.status} svc={s.svc} custom={custom} />
                        <select value={s.status} onChange={function(e){ updStatus(s.id,e.target.value); }} style={{...inp,width:165,padding:"5px 8px",fontSize:12}}>
                          {getStages(s.svc,custom).map(function(k){ return <option key={k}>{k}</option>; })}
                        </select>
                      </div>
                    );
                  })}

                  {/* Customer ID Card Preview */}
                  {(function(){
                    var custSvcs=svcs.filter(function(s){ return s.cid===selC.id; });
                    var custPays=pays.filter(function(p){ return p.cid===selC.id; });
                    var totalFees=custPays.reduce(function(s,p){ return s+p.total; },0);
                    var totalPaid=custPays.reduce(function(s,p){ return s+p.recv; },0);
                    var totalPend=custPays.reduce(function(s,p){ return s+p.pend; },0);
                    var initials=selC.name.split(" ").map(function(x){ return x[0]; }).slice(0,2).join("");

                    function doPrint(){
                      var svcRows=custSvcs.map(function(s){
                        var pay=custPays.find(function(p){ return p.sid===s.id; });
                        return "<tr>"
                          +"<td style='padding:5px 8px;border-bottom:1px solid #f0f4fa;font-size:10px;color:#1a2942;font-weight:700;'>"+s.svc+"</td>"
                          +"<td style='padding:5px 8px;border-bottom:1px solid #f0f4fa;font-size:9px;color:#6b7280;'>"+s.date+"</td>"
                          +"<td style='padding:5px 8px;border-bottom:1px solid #f0f4fa;font-size:9px;color:#9ca3af;'>"+(s.appNo||"-")+"</td>"
                          +"<td style='padding:5px 8px;border-bottom:1px solid #f0f4fa;font-size:9px;font-weight:800;color:#111827;'>"+(pay&&pay.pend>0?"Due: Rs."+pay.pend:"Paid")+"</td>"
                          +"</tr>";
                      }).join("");
                      var html="<!DOCTYPE html><html><head><title>Customer Card - "+selC.name+"</title>"
                        +"<style>"
                        +"*{margin:0;padding:0;box-sizing:border-box;}"
                        +"body{font-family:Segoe UI,Arial,sans-serif;background:#fff;display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px;}"
                        +".lbl{font-size:9px;color:#6b7280;margin:4px 0 2px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;}"
                        +".card{width:340px;border:2px solid #1a2942;border-radius:10px;overflow:hidden;}"
                        +".hdr{background:#1a2942;padding:8px 14px;display:flex;justify-content:space-between;align-items:center;}"
                        +".body{background:#fff;padding:10px 14px;}"
                        +"table{width:100%;border-collapse:collapse;}"
                        +"th{font-size:8px;font-weight:700;color:#6b7280;text-transform:uppercase;padding:4px 8px;text-align:left;background:#f5f5f5;border-bottom:1px solid #ddd;}"
                        +"td{padding:4px 8px;border-bottom:1px solid #f0f0f0;font-size:9px;color:#1a2942;}"
                        +"@media print{body{padding:8px;}@page{size:A5 portrait;margin:8mm;}.card{page-break-inside:avoid;}}"
                        +"</style></head><body>"
                        +"<p class='lbl'>Front</p>"
                        +"<div class='card'>"
                        +"<div class='hdr'>"
                        +"<div><div style='font-size:11px;font-weight:900;color:#fff;'>Ashirwad Multiservices</div><div style='font-size:7px;color:rgba(255,255,255,.85);font-weight:600;'>Gandhi Chaman Old Jalna</div></div>"
                        +"<div style='text-align:right;'>"
                        +"<div style='display:flex;align-items:center;gap:3px;justify-content:flex-end;margin-bottom:2px;'>"
                        +"<svg width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,.7)' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.18a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .5h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 15.92z'/></svg>"
                        +"<span style='font-size:8px;font-weight:700;color:#fff;'>7057075143</span>"
                        +"</div>"
                        +"<div style='font-size:7px;font-weight:800;border:1px solid rgba(255,255,255,.5);padding:2px 8px;border-radius:999px;color:#fff;'>CUSTOMER COPY</div>"
                        +"</div>"
                        +"</div>"
                        +"<div class='body'>"
                        +"<div style='display:flex;gap:10px;align-items:center;margin-bottom:10px;padding-bottom:10px;border-bottom:1.5px solid #1a2942;'>"
                        +"<div style='width:40px;height:40px;border-radius:8px;background:#1a2942;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:900;color:#fff;flex-shrink:0;'>"+initials+"</div>"
                        +"<div><div style='font-size:18px;font-weight:900;color:#1a2942;line-height:1;'>"+selC.name+"</div>"
                        +"<div style='font-size:8px;color:#6b7280;margin-top:3px;'>"+selC.id+" | +91 "+selC.mobile+(selC.email?" | "+selC.email:"")+"</div></div>"
                        +"</div>"
                        +"<div style='display:flex;justify-content:space-between;align-items:center;'>"
                        +"<div><div style='font-size:8px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px;'>Total Balance Due</div>"
                        +"<div style='font-size:24px;font-weight:900;color:#1a2942;'>"+(totalPend>0?"Rs."+totalPend:"All Cleared")+"</div></div>"
                        +"<div style='text-align:right;'><div style='font-size:8px;color:#9ca3af;'>"+TODAY+"</div>"
                        +"<div style='font-size:8px;color:#9ca3af;margin-top:2px;'>"+custSvcs.length+" application(s)</div></div>"
                        +"</div></div></div>"
                        +"<p class='lbl'>Back</p>"
                        +"<div class='card'>"
                        +"<div class='hdr'>"
                        +"<div style='font-size:10px;font-weight:900;color:#fff;'>Applications ("+custSvcs.length+")</div>"
                        +"<div style='font-size:7px;color:rgba(255,255,255,.85);font-weight:600;'>"+selC.name+" | "+selC.id+"</div>"
                        +"</div>"
                        +"<div class='body' style='padding:8px 0;'>"
                        +"<table><thead><tr><th>Service</th><th>Date</th><th>App No</th><th>Due</th></tr></thead><tbody>"
                        +svcRows
                        +"</tbody></table>"
                        +"<div style='padding:6px 8px 0;font-size:7.5px;color:#9ca3af;text-align:center;display:flex;justify-content:center;align-items:center;gap:3px;'>"
                        +"<svg width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='#9ca3af' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.18a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .5h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 15.92z'/></svg>"
                        +"<svg width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='#111827' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z'/><circle cx='12' cy='10' r='3'/></svg>"+"<span>Gandhi Chaman Old Jalna</span>"+"<svg width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='#111827' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.18a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .5h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 15.92z'/></svg>"+"<span>7057075143</span></div>"
                        +"</div></div>"
                        +"<script>window.onload=function(){ window.print(); };<\/script></body></html>";
                      var blob=new Blob([html],{type:"text/html"});
                      var a=document.createElement("a");
                      a.href=URL.createObjectURL(blob);
                      a.target="_blank";
                      document.body.appendChild(a); a.click(); document.body.removeChild(a);
                    }

                    return (
                      <div style={{marginTop:18}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                          <div style={{fontSize:11,fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:".06em"}}>ID Card Preview</div>
                          <button onClick={doPrint} style={{...btnP,fontSize:12,padding:"7px 18px"}}>Print Customer Copy</button>
                        </div>

                        <div style={{display:"flex",flexDirection:"column",gap:16}}>

                          {/* Card 1 - Admin (no print) */}
                          <div>
                            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                              <div style={{fontSize:10,fontWeight:700,color:"#f97316"}}>Card 1 - Admin Copy (Preview only)</div>
                              <div style={{fontSize:10,color:"#c0ccd8",background:"#f5f8ff",padding:"2px 8px",borderRadius:6,border:"1px solid #e8eef8"}}>Not printed</div>
                            </div>
                            <div style={{width:300,borderRadius:14,overflow:"hidden",boxShadow:"0 8px 28px rgba(0,30,80,.2)",position:"relative"}}>
                              <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:"linear-gradient(90deg,#f97316,#ea580c,#f59e0b)"}}></div>
                              <div style={{background:"linear-gradient(135deg,#0a1628,#1e3a8a,#1e40af)",padding:"12px 14px"}}>
                                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                                  <div><div style={{fontSize:10,fontWeight:900,color:"#fff"}}>Ashirwad Multiservices</div><div style={{fontSize:7,color:"rgba(255,255,255,.35)"}}>Jalna, Maharashtra</div></div>
                                  <div style={{fontSize:7,fontWeight:800,background:"rgba(249,115,22,.3)",border:"1px solid rgba(249,115,22,.5)",padding:"2px 7px",borderRadius:999,color:"#fed7aa"}}>ADMIN COPY</div>
                                </div>
                                <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
                                  <div style={{width:36,height:36,borderRadius:9,background:"linear-gradient(135deg,#f97316,#ea580c)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:"#fff",flexShrink:0}}>{initials}</div>
                                  <div><div style={{fontSize:14,fontWeight:900,color:"#fff",lineHeight:1}}>{selC.name}</div><div style={{fontSize:7.5,color:"rgba(255,255,255,.4)",marginTop:2}}>{selC.id} | +91 {selC.mobile}</div></div>
                                </div>
                                {custSvcs.map(function(s){
                                  var pay=custPays.find(function(p){ return p.sid===s.id; });
                                  return <div key={s.id} style={{display:"flex",justifyContent:"space-between",padding:"2px 0",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
                                    <div><div style={{fontSize:9,color:"rgba(255,255,255,.85)",fontWeight:700}}>{s.svc}</div><div style={{fontSize:7,color:"rgba(255,255,255,.3)"}}>{s.date}{s.appNo?" | "+s.appNo:""}</div></div>
                                    <span style={{fontSize:8,fontWeight:700,color:pay&&pay.pend>0?"#fca5a5":"#86efac",whiteSpace:"nowrap"}}>{pay?"Rs."+pay.total+" Pd:Rs."+pay.recv+(pay.pend>0?" Due:Rs."+pay.pend:""):"No pay"}</span>
                                  </div>;
                                })}
                                <div style={{marginTop:8,paddingTop:6,borderTop:"1px solid rgba(255,255,255,.1)",display:"flex",gap:10}}>
                                  <div><div style={{fontSize:7,fontWeight:700,color:"rgba(255,255,255,.4)",textTransform:"uppercase"}}>Total</div><div style={{fontSize:11,fontWeight:800,color:"#93c5fd"}}>{fmt(totalFees)}</div></div>
                                  <div><div style={{fontSize:7,fontWeight:700,color:"rgba(255,255,255,.4)",textTransform:"uppercase"}}>Paid</div><div style={{fontSize:11,fontWeight:800,color:"#86efac"}}>{fmt(totalPaid)}</div></div>
                                  <div><div style={{fontSize:7,fontWeight:700,color:"rgba(255,255,255,.4)",textTransform:"uppercase"}}>Balance</div><div style={{fontSize:11,fontWeight:800,color:totalPend>0?"#fca5a5":"#86efac"}}>{totalPend>0?fmt(totalPend):"Cleared"}</div></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Card 2 - Customer Copy - FRONT */}
                          <div>
                            <div style={{fontSize:10,fontWeight:700,color:"#16a34a",marginBottom:6}}>Card 2 - Customer Copy (Printable)</div>

                            {/* FRONT */}
                            <div style={{fontSize:9,fontWeight:600,color:"#8fa0b8",marginBottom:6,textTransform:"uppercase",letterSpacing:".06em"}}>Front</div>
                            <div style={{width:300,height:160,borderRadius:12,overflow:"hidden",boxShadow:"0 4px 16px rgba(0,0,0,.1)",border:"2px solid #1a2942",position:"relative",background:"#fff"}}>
                              {/* Top dark header bar */}
                              <div style={{background:"#1a2942",padding:"8px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                <div>
                                  <div style={{fontSize:10,fontWeight:900,color:"#fff",letterSpacing:"-.01em"}}>Ashirwad Multiservices</div>
                                  <div style={{fontSize:7,color:"rgba(255,255,255,.85)",fontWeight:600}}>Gandhi Chaman Old Jalna</div>
                                </div>
                                <div style={{textAlign:"right"}}>
                                  <div style={{display:"flex",alignItems:"center",gap:3,justifyContent:"flex-end",marginBottom:3}}>
                                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.18a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .5h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 15.92z"/></svg>
                                    <span style={{fontSize:8,fontWeight:700,color:"#fff"}}>7057075143</span>
                                  </div>
                                  <div style={{fontSize:7,fontWeight:800,border:"1px solid rgba(255,255,255,.4)",padding:"2px 8px",borderRadius:999,color:"#fff",letterSpacing:".04em"}}>CUSTOMER COPY</div>
                                </div>
                              </div>
                              {/* White body */}
                              <div style={{padding:"10px 14px",display:"flex",flexDirection:"column",height:"calc(100% - 40px)",boxSizing:"border-box"}}>
                                <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
                                  <div style={{width:38,height:38,borderRadius:8,background:"#1a2942",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:"#fff",flexShrink:0,border:"2px solid #1a2942"}}>{initials}</div>
                                  <div>
                                    <div style={{fontSize:16,fontWeight:900,color:"#1a2942",lineHeight:1}}>{selC.name}</div>
                                    <div style={{fontSize:7.5,color:"#6b7280",marginTop:2}}>{selC.id} | +91 {selC.mobile}{selC.email?" | "+selC.email:""}</div>
                                  </div>
                                </div>
                                <div style={{borderTop:"2px solid #1a2942",paddingTop:8,display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"auto"}}>
                                  <div>
                                    <div style={{fontSize:8,fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:".06em",marginBottom:2}}>Total Balance Due</div>
                                    <div style={{fontSize:22,fontWeight:900,color:totalPend>0?"#1a2942":"#374151"}}>{totalPend>0?fmt(totalPend):"All Cleared"}</div>
                                  </div>
                                  <div style={{textAlign:"right"}}>
                                    <div style={{fontSize:8,color:"#9ca3af"}}>{TODAY}</div>
                                    <div style={{fontSize:8,color:"#9ca3af",marginTop:2}}>{custSvcs.length} application(s)</div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* BACK */}
                            <div style={{fontSize:9,fontWeight:600,color:"#8fa0b8",marginTop:10,marginBottom:6,textTransform:"uppercase",letterSpacing:".06em"}}>Back</div>
                            <div style={{width:300,height:160,borderRadius:12,overflow:"hidden",boxShadow:"0 4px 16px rgba(0,0,0,.1)",border:"2px solid #1a2942",background:"#fff"}}>
                              {/* Top dark header bar */}
                              <div style={{background:"#1a2942",padding:"8px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                <div style={{fontSize:10,fontWeight:900,color:"#fff"}}>Applications ({custSvcs.length})</div>
                                <div style={{fontSize:7,color:"rgba(255,255,255,.85)",fontWeight:600}}>Ashirwad Multiservices</div>
                              </div>
                              {/* Table */}
                              <div style={{padding:"6px 0",height:"calc(100% - 36px)",boxSizing:"border-box",overflowY:"hidden"}}>
                                <table style={{width:"100%",borderCollapse:"collapse"}}>
                                  <thead><tr style={{background:"#f5f8ff"}}>
                                    {["Service","Date","App No","Due"].map(function(h){ return <th key={h} style={{padding:"4px 10px",textAlign:"left",fontSize:7.5,fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:".05em",borderBottom:"1px solid #e5e7eb"}}>{h}</th>; })}
                                  </tr></thead>
                                  <tbody>
                                    {custSvcs.map(function(s){
                                      var pay=custPays.find(function(p){ return p.sid===s.id; });
                                      return <tr key={s.id}>
                                        <td style={{padding:"4px 10px",borderBottom:"1px solid #f0f4fa",fontSize:9,color:"#1a2942",fontWeight:700}}>{s.svc}</td>
                                        <td style={{padding:"4px 10px",borderBottom:"1px solid #f0f4fa",fontSize:8,color:"#6b7280"}}>{s.date}</td>
                                        <td style={{padding:"4px 10px",borderBottom:"1px solid #f0f4fa",fontSize:8,color:"#9ca3af"}}>{s.appNo||"-"}</td>
                                        <td style={{padding:"4px 10px",borderBottom:"1px solid #f0f4fa",fontSize:9,fontWeight:800,color:pay&&pay.pend>0?"#111827":"#374151"}}>{pay&&pay.pend>0?fmt(pay.pend):"Paid"}</td>
                                      </tr>;
                                    })}
                                  </tbody>
                                </table>
                                <div style={{padding:"6px 10px 0",fontSize:7.5,color:"#111827",fontWeight:600,textAlign:"center",display:"flex",justifyContent:"center",alignItems:"center",gap:4}}>
                                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                  <span>Gandhi Chaman Old Jalna</span>
                                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.18a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .5h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 15.92z"/></svg>
                                  <span>7057075143</span>
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {tab==="services"&&(
            <div>
              <div style={{display:"flex",gap:8,marginBottom:10,alignItems:"center"}}>
                <div style={{display:"flex",background:"#fff",border:"1.5px solid #dbe4f0",borderRadius:10,overflow:"hidden"}}>
                  {[["board","Service Board"],["list","List"],["config","Configure"]].map(function(v){
                    return <button key={v[0]} onClick={function(){ setSvcView(v[0]); }} style={{padding:"7px 14px",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600,background:svcView===v[0]?"#1e40af":"transparent",color:svcView===v[0]?"#fff":"#6b7280"}}>{v[1]}</button>;
                  })}
                </div>
                <span style={{fontSize:13,color:"#8fa0b8",marginLeft:"auto"}}>{svcs.length} total</span>
              </div>

              {/* Quick Filter Bar */}
              {(svcView==="board"||svcView==="list")&&(
                <div style={{background:"#fff",borderRadius:12,border:"1.5px solid #dbe4f0",padding:"12px 16px",marginBottom:14,display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#6b7280",flexShrink:0}}>Quick Filter:</div>

                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <label style={{fontSize:11,fontWeight:600,color:"#9fb0c8",textTransform:"uppercase",letterSpacing:".05em"}}>Service</label>
                    <select value={filterSvc} onChange={function(e){ setFilterSvc(e.target.value); }} style={{padding:"5px 10px",borderRadius:8,border:"1.5px solid #dbe4f0",fontSize:12,fontFamily:"inherit",background:"#f7faff",color:"#1a2942",outline:"none",cursor:"pointer"}}>
                      <option value="All">All Services</option>
                      {svcTypes.map(function(sv){ return <option key={sv} value={sv}>{sv}</option>; })}
                    </select>
                  </div>

                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <label style={{fontSize:11,fontWeight:600,color:"#9fb0c8",textTransform:"uppercase",letterSpacing:".05em"}}>Status</label>
                    <select value={filterStatus} onChange={function(e){ setFilterStatus(e.target.value); }} style={{padding:"5px 10px",borderRadius:8,border:"1.5px solid #dbe4f0",fontSize:12,fontFamily:"inherit",background:"#f7faff",color:"#1a2942",outline:"none",cursor:"pointer"}}>
                      <option value="All">All Statuses</option>
                      {filterSvc!=="All"
                        ? getStages(filterSvc,custom).map(function(k){ return <option key={k} value={k}>{k}</option>; })
                        : Array.from(new Set(svcs.map(function(s){ return s.status; }))).sort().map(function(k){ return <option key={k} value={k}>{k}</option>; })
                      }
                    </select>
                  </div>

                  {(filterSvc!=="All"||filterStatus!=="All")&&(
                    <div style={{display:"flex",alignItems:"center",gap:10,marginLeft:"auto"}}>
                      <span style={{fontSize:12,fontWeight:700,color:"#2563eb",background:"#eff6ff",padding:"4px 12px",borderRadius:999}}>
                        {svcs.filter(function(s){ return (filterSvc==="All"||s.svc===filterSvc)&&(filterStatus==="All"||s.status===filterStatus); }).length} results
                      </span>
                      <button onClick={function(){ setFilterSvc("All"); setFilterStatus("All"); }} style={{background:"#fee2e2",color:"#ef4444",border:"none",borderRadius:7,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Clear</button>
                    </div>
                  )}
                </div>
              )}

              {svcView==="board"&&(
                <div>
                  {svcTypes.map(function(sv){
                    var sa=svcs.filter(function(s){
                      return s.svc===sv &&
                        (filterSvc==="All"||s.svc===filterSvc) &&
                        (filterStatus==="All"||s.status===filterStatus);
                    });
                    if(!sa.length) return null;
                    return (
                      <div key={sv} style={{background:"#fff",borderRadius:14,border:"1.5px solid #dbe4f0",marginBottom:14,overflow:"hidden"}}>
                        <div style={{display:"flex",alignItems:"center",gap:10,padding:"11px 16px",background:"#f8faff",borderBottom:"1.5px solid #dbe4f0"}}>
                          <div style={{width:8,height:8,borderRadius:"50%",background:"#2563eb"}}></div>
                          <span style={{fontSize:14,fontWeight:700,color:"#1a2942"}}>{sv}</span>
                          <span style={{fontSize:11,fontWeight:600,background:"#eff6ff",color:"#2563eb",padding:"2px 8px",borderRadius:999}}>{sa.length}</span>
                        </div>
                        <table style={{width:"100%",borderCollapse:"collapse"}}>
                          <thead><tr style={{background:"#f8faff"}}>{["Customer","App No","Date","Status","Update"].map(function(h){ return <th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:10,fontWeight:600,color:"#9fb0c8",textTransform:"uppercase",borderBottom:"1px solid #f0f4fa"}}>{h}</th>; })}</tr></thead>
                          <tbody>
                            {sa.map(function(s){
                              return (
                                <tr key={s.id} style={{borderBottom:"1px solid #f5f8ff"}}>
                                  <td style={{padding:"9px 12px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><Av name={s.cname} size={26} /><div><div style={{fontSize:13,fontWeight:600,color:"#1a2942"}}>{s.cname}</div><div style={{fontSize:10,color:"#8fa0b8"}}>{s.id}</div></div></div></td>
                                  <td style={{padding:"9px 12px",fontSize:12,color:"#6b7280"}}>{s.appNo||"-"}</td>
                                  <td style={{padding:"9px 12px",fontSize:12,color:"#8fa0b8"}}>{s.date}</td>
                                  <td style={{padding:"9px 12px"}}><Badge status={s.status} svc={s.svc} custom={custom} /></td>
                                  <td style={{padding:"9px 12px"}}>
                                    <select value={s.status} onChange={function(e){ updStatus(s.id,e.target.value); }} style={{...inp,width:170,padding:"4px 7px",fontSize:12}}>
                                      {getStages(s.svc,custom).map(function(k){ return <option key={k}>{k}</option>; })}
                                    </select>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  }).filter(function(x){ return x; })}
                  {svcs.length===0&&<div style={{background:"#fff",borderRadius:14,border:"1.5px dashed #dbe4f0",padding:"48px",textAlign:"center",color:"#8fa0b8"}}>No applications yet.</div>}
                </div>
              )}

              {svcView==="list"&&(
                <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #dbe4f0",overflow:"hidden"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr style={{background:"#f5f8ff"}}>{["Customer","Service","App No","Date","Status","Update"].map(function(h){ return <th key={h} style={{padding:"9px 12px",textAlign:"left",fontSize:10,fontWeight:600,color:"#9fb0c8",textTransform:"uppercase",borderBottom:"1px solid #f0f4fa"}}>{h}</th>; })}</tr></thead>
                    <tbody>
                      {svcs.filter(function(s){
                        return (filterSvc==="All"||s.svc===filterSvc) &&
                               (filterStatus==="All"||s.status===filterStatus);
                      }).map(function(s){
                        return (
                          <tr key={s.id} style={{borderBottom:"1px solid #f5f8ff"}}>
                            <td style={{padding:"10px 12px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><Av name={s.cname} size={24} /><span style={{fontSize:13,fontWeight:600,color:"#1a2942"}}>{s.cname}</span></div></td>
                            <td style={{padding:"10px 12px",fontSize:12,fontWeight:600,color:"#374151"}}>{s.svc}</td>
                            <td style={{padding:"10px 12px",fontSize:12,color:"#8fa0b8"}}>{s.appNo||"-"}</td>
                            <td style={{padding:"10px 12px",fontSize:12,color:"#8fa0b8"}}>{s.date}</td>
                            <td style={{padding:"10px 12px"}}><Badge status={s.status} svc={s.svc} custom={custom} /></td>
                            <td style={{padding:"10px 12px"}}><select value={s.status} onChange={function(e){ updStatus(s.id,e.target.value); }} style={{...inp,width:160,padding:"4px 7px",fontSize:12}}>{getStages(s.svc,custom).map(function(k){ return <option key={k}>{k}</option>; })}</select></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {svcView==="config"&&(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,alignItems:"start"}}>

                  {/* Left: Service Types */}
                  <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #dbe4f0",overflow:"hidden"}}>
                    <div style={{background:"linear-gradient(135deg,#1e40af,#2563eb)",padding:"12px 14px"}}>
                      <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>Service Types ({svcTypes.length})</div>
                      <div style={{fontSize:10,color:"rgba(255,255,255,.6)",marginTop:1}}>Add / Edit / Remove services</div>
                    </div>
                    <div style={{padding:"10px 12px",borderBottom:"1px solid #f0f4fa"}}>
                      <div style={{display:"flex",gap:6}}>
                        <input value={newST} onChange={function(e){ setNewST(e.target.value); }} onKeyDown={function(e){ if(e.key==="Enter"&&newST.trim()){ setSvcTypes(function(p){ return p.concat([newST.trim()]); }); setNewST(""); } }} placeholder="Add service..." style={{...inp,flex:1,fontSize:12,padding:"6px 9px"}} />
                        <button onClick={function(){ if(newST.trim()){ setSvcTypes(function(p){ return p.concat([newST.trim()]); }); setNewST(""); } }} style={{...btnP,padding:"6px 12px",fontSize:12}}>+</button>
                      </div>
                    </div>
                    <div style={{maxHeight:420,overflowY:"auto"}}>
                      {svcTypes.map(function(sv,i){
                        return (
                          <div key={i} style={{borderBottom:"1px solid #f5f8ff",background:editST&&editST.i===i?"#f0f7ff":"transparent"}}>
                            {editST&&editST.i===i
                              ? <div style={{display:"flex",gap:6,padding:"8px 10px"}}>
                                  <input autoFocus value={editST.v} onChange={function(e){ setEditST(Object.assign({},editST,{v:e.target.value})); }} onKeyDown={function(e){ if(e.key==="Enter"&&editST.v.trim()){ setSvcTypes(function(p){ return p.map(function(s,j){ return j===i?editST.v.trim():s; }); }); setEditST(null); } if(e.key==="Escape") setEditST(null); }} style={{...inp,flex:1,fontSize:12,padding:"5px 8px"}} />
                                  <button onClick={function(){ setSvcTypes(function(p){ return p.map(function(s,j){ return j===i?editST.v.trim():s; }); }); setEditST(null); }} style={{background:"#2563eb",color:"#fff",border:"none",borderRadius:6,padding:"5px 9px",fontSize:12,fontWeight:700,cursor:"pointer"}}>OK</button>
                                  <button onClick={function(){ setEditST(null); }} style={{background:"#f3f4f6",color:"#6b7280",border:"none",borderRadius:6,padding:"5px 8px",fontSize:12,cursor:"pointer"}}>x</button>
                                </div>
                              : <div style={{display:"flex",alignItems:"center",padding:"9px 12px",gap:8}}>
                                  <span style={{flex:1,fontSize:13,fontWeight:600,color:"#1a2942"}}>{sv}</span>
                                  <span style={{fontSize:10,color:"#bfcad8",marginRight:2}}>{svcs.filter(function(s){ return s.svc===sv; }).length}</span>
                                  <button onClick={function(){ setStageEd(sv); }} title="Stages" style={{background:"none",border:"none",cursor:"pointer",fontSize:15,padding:"2px 4px"}}>&#9881;</button>
                                  <button onClick={function(){ setEditST({i:i,v:sv}); }} style={{background:"none",border:"none",cursor:"pointer",fontSize:14,padding:"2px 3px"}}>&#9998;</button>
                                  <button onClick={function(){ if(!svcs.some(function(s){ return s.svc===sv; })&&true){ setSvcTypes(function(p){ return p.filter(function(_,j){ return j!==i; }); }); } }} style={{background:"none",border:"none",cursor:"pointer",color:"#ef4444",padding:"2px 3px"}}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                                  </button>
                                </div>
                            }
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: Document Types per Service */}
                  <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #dbe4f0",overflow:"hidden"}}>
                    <div style={{background:"linear-gradient(135deg,#f97316,#ea580c)",padding:"12px 14px"}}>
                      <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>Document Types per Service</div>
                      <div style={{fontSize:10,color:"rgba(255,255,255,.6)",marginTop:1}}>Define what documents belong to each service</div>
                    </div>
                    <div style={{maxHeight:500,overflowY:"auto"}}>
                      {svcTypes.map(function(sv){
                        var current = svcDocTypes[sv] || DEF_SVC_DOCS[sv] || ["Acknowledgement","Government Receipt"];
                        var isCustom = !!svcDocTypes[sv];
                        return (
                          <div key={sv} style={{borderBottom:"1.5px solid #f0f4fa"}}>
                            {/* Service header */}
                            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:"#f8faff",cursor:"pointer"}} onClick={function(){
                              var key = "__open_"+sv;
                              setOpenDocSvc(openDocSvc===sv ? null : sv);
                            }}>
                              <div>
                                <div style={{fontSize:12.5,fontWeight:700,color:"#1a2942"}}>{sv}</div>
                                <div style={{fontSize:10,color:"#8fa0b8",marginTop:1}}>{current.length} doc types {isCustom?"(custom)":"(default)"}</div>
                              </div>
                              <span style={{fontSize:12,color:"#8fa0b8"}}>{openDocSvc===sv?"v":">"}</span>
                            </div>
                            {/* Expanded editor */}
                            {openDocSvc===sv&&(
                              <div style={{padding:"10px 14px",background:"#fffbf5",borderTop:"1px solid #fde68a"}}>
                                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
                                  {current.map(function(dt,di){
                                    return (
                                      <span key={di} style={{display:"inline-flex",alignItems:"center",gap:5,background:"#fff",border:"1.5px solid #dbe4f0",borderRadius:999,padding:"3px 10px",fontSize:11,fontWeight:600,color:"#374151"}}>
                                        {dt}
                                        <button onClick={function(){ var nd=current.filter(function(_,j){ return j!==di; }); setSvcDocTypes(function(x){ var upd=Object.assign({},x); upd[sv]=nd; return upd; }); }} style={{background:"none",border:"none",cursor:"pointer",color:"#f87171",fontSize:12,padding:0,lineHeight:1,marginLeft:2}}>x</button>
                                      </span>
                                    );
                                  })}
                                </div>
                                <div style={{display:"flex",gap:6,marginBottom:6}}>
                                  <input
                                    id={"newdt_"+sv}
                                    placeholder="Add doc type e.g. E-PAN Copy..."
                                    style={{...inp,flex:1,fontSize:11,padding:"5px 9px"}}
                                    onKeyDown={function(e){
                                      if(e.key==="Enter"&&e.target.value.trim()){
                                        var nd=current.concat([e.target.value.trim()]);
                                        setSvcDocTypes(function(x){ var upd=Object.assign({},x); upd[sv]=nd; return upd; });
                                        e.target.value="";
                                      }
                                    }}
                                  />
                                  <button onClick={function(){
                                    var el=document.getElementById("newdt_"+sv);
                                    if(el&&el.value.trim()){
                                      var nd=current.concat([el.value.trim()]);
                                      setSvcDocTypes(function(x){ var upd=Object.assign({},x); upd[sv]=nd; return upd; });
                                      el.value="";
                                    }
                                  }} style={{...btnO,padding:"5px 12px",fontSize:11}}>+ Add</button>
                                </div>
                                {isCustom&&(
                                  <button onClick={function(){ setSvcDocTypes(function(x){ var upd=Object.assign({},x); delete upd[sv]; return upd; }); }} style={{background:"none",border:"none",fontSize:10,color:"#8fa0b8",cursor:"pointer",textDecoration:"underline",padding:0}}>Reset to default</button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {tab==="active"&&(function(){
            var doneWords=["delivered","completed","done","rejected","issued","generated","dispatched","cleared","published"];
            var activeSvcs=svcs.filter(function(s){
              var st=s.status.toLowerCase();
              return !doneWords.some(function(w){ return st.indexOf(w)>=0; });
            });
            var filteredSvcs=activeSvcs.filter(function(s){
              return (activeFilterSvc==="All"||s.svc===activeFilterSvc)&&
                     (activeFilterStatus==="All"||s.status===activeFilterStatus);
            });
            var grouped={};
            svcTypes.forEach(function(sv){
              var list=filteredSvcs.filter(function(s){ return s.svc===sv; });
              if(list.length) grouped[sv]=list;
            });
            return (
              <div>
                {/* KPIs - only show non-zero */}
                <div style={{display:"flex",gap:14,marginBottom:18,flexWrap:"wrap"}}>
                  {[
                    {label:"Total Active", value:filteredSvcs.length, sub:"In progress", color:"#e11d48"},
                    {label:"Pending", value:filteredSvcs.filter(function(s){ return s.status==="Pending"; }).length, sub:"Not started", color:"#f97316"},
                    {label:"In Process", value:filteredSvcs.filter(function(s){ return s.status!=="Pending"; }).length, sub:"Work ongoing", color:"#2563eb"},
                    {label:"Services", value:Object.keys(grouped).length, sub:"Active types", color:"#8b5cf6"}
                  ].filter(function(k){ return k.value>0; }).map(function(k){
                    return <KPI key={k.label} label={k.label} value={k.value} sub={k.sub} color={k.color} />;
                  })}
                </div>

                {/* Quick Filter Bar */}
                <div style={{background:"#fff",borderRadius:12,border:"1.5px solid #dbe4f0",padding:"12px 16px",marginBottom:16,display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#6b7280",flexShrink:0}}>Quick Filter:</div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <label style={{fontSize:11,fontWeight:600,color:"#9fb0c8",textTransform:"uppercase",letterSpacing:".05em"}}>Service</label>
                    <select value={activeFilterSvc} onChange={function(e){ setActiveFilterSvc(e.target.value); setActiveFilterStatus("All"); }} style={{padding:"5px 10px",borderRadius:8,border:"1.5px solid #dbe4f0",fontSize:12,fontFamily:"inherit",background:"#f7faff",color:"#1a2942",outline:"none",cursor:"pointer"}}>
                      <option value="All">All Services</option>
                      {svcTypes.filter(function(sv){ return activeSvcs.some(function(s){ return s.svc===sv; }); }).map(function(sv){ return <option key={sv} value={sv}>{sv}</option>; })}
                    </select>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <label style={{fontSize:11,fontWeight:600,color:"#9fb0c8",textTransform:"uppercase",letterSpacing:".05em"}}>Status</label>
                    <select value={activeFilterStatus} onChange={function(e){ setActiveFilterStatus(e.target.value); }} style={{padding:"5px 10px",borderRadius:8,border:"1.5px solid #dbe4f0",fontSize:12,fontFamily:"inherit",background:"#f7faff",color:"#1a2942",outline:"none",cursor:"pointer"}}>
                      <option value="All">All Statuses</option>
                      {(activeFilterSvc!=="All"
                        ? getStages(activeFilterSvc,custom)
                        : Array.from(new Set(activeSvcs.map(function(s){ return s.status; }))).sort()
                      ).map(function(k){ return <option key={k} value={k}>{k}</option>; })}
                    </select>
                  </div>
                  {(activeFilterSvc!=="All"||activeFilterStatus!=="All")&&(
                    <div style={{display:"flex",alignItems:"center",gap:10,marginLeft:"auto"}}>
                      <span style={{fontSize:12,fontWeight:700,color:"#e11d48",background:"#fff1f2",padding:"4px 12px",borderRadius:999}}>{filteredSvcs.length} results</span>
                      <button onClick={function(){ setActiveFilterSvc("All"); setActiveFilterStatus("All"); }} style={{background:"#fee2e2",color:"#ef4444",border:"none",borderRadius:7,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Clear</button>
                    </div>
                  )}
                </div>

                {filteredSvcs.length===0
                  ? <div style={{background:"#f0fdf4",borderRadius:14,padding:"40px",textAlign:"center",border:"1.5px solid #bbf7d0"}}>
                      <div style={{fontSize:32,marginBottom:10}}>v</div>
                      <div style={{fontSize:16,fontWeight:700,color:"#16a34a"}}>All caught up!</div>
                      <div style={{fontSize:13,color:"#8fa0b8",marginTop:4}}>No pending applications right now</div>
                    </div>
                  : Object.keys(grouped).map(function(sv){
                      var list=grouped[sv];
                      return (
                        <div key={sv} style={{background:"#fff",borderRadius:14,border:"1.5px solid #dbe4f0",marginBottom:14,overflow:"hidden"}}>
                          {/* Service header */}
                          <div style={{display:"flex",alignItems:"center",gap:10,padding:"11px 16px",background:"linear-gradient(135deg,#f8faff,#eff6ff)",borderBottom:"1.5px solid #dbe4f0"}}>
                            <div style={{width:8,height:8,borderRadius:"50%",background:"#e11d48",flexShrink:0}}></div>
                            <div style={{fontSize:13,fontWeight:700,color:"#1a2942",flex:1}}>{sv}</div>
                            <span style={{fontSize:11,fontWeight:700,background:"#fee2e2",color:"#e11d48",padding:"3px 10px",borderRadius:999}}>{list.length} pending</span>
                          </div>
                          {/* Applications */}
                          <table style={{width:"100%",borderCollapse:"collapse"}}>
                            <thead>
                              <tr style={{background:"#f9fbff"}}>
                                {["Customer","Mobile","App No","Date","Status","Action",""].map(function(h){
                                  return <th key={h} style={{padding:"7px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:"#9fb0c8",textTransform:"uppercase",borderBottom:"1px solid #f0f4fa"}}>{h}</th>;
                                })}
                              </tr>
                            </thead>
                            <tbody>
                              {list.map(function(s){
                                var cust=custs.find(function(c){ return c.id===s.cid; });
                                var pay=pays.find(function(p){ return p.sid===s.id; });
                                return (
                                  <tr key={s.id} style={{borderBottom:"1px solid #f5f8ff"}}>
                                    <td style={{padding:"10px 12px"}}>
                                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                                        <Av name={s.cname} size={26} />
                                        <div>
                                          <div style={{fontSize:12,fontWeight:700,color:"#1a2942"}}>{s.cname}</div>
                                          <div style={{fontSize:10,color:"#8fa0b8"}}>{s.cid}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td style={{padding:"10px 12px",fontSize:12,color:"#6b7280"}}>{cust?cust.mobile:"-"}</td>
                                    <td style={{padding:"10px 12px",fontSize:12,color:"#8fa0b8"}}>{s.appNo||"-"}</td>
                                    <td style={{padding:"10px 12px",fontSize:12,color:"#8fa0b8"}}>{s.date}</td>
                                    <td style={{padding:"10px 12px"}}>
                                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                                        <Badge status={s.status} svc={s.svc} custom={custom} />
                                        {pay&&pay.pend>0&&<span style={{fontSize:10,fontWeight:700,color:"#ef4444",background:"#fee2e2",padding:"2px 7px",borderRadius:999}}>Due: {fmt(pay.pend)}</span>}
                                      </div>
                                    </td>
                                    <td style={{padding:"10px 12px"}}>
                                      <select value={s.status} onChange={function(e){ updStatus(s.id,e.target.value); }} style={{...inp,width:160,padding:"4px 7px",fontSize:12}}>
                                        {getStages(s.svc,custom).map(function(k){ return <option key={k}>{k}</option>; })}
                                      </select>
                                    </td>
                                    <td style={{padding:"10px 12px"}}>
                                      <button onClick={function(){
                                        var lastStage=getStages(s.svc,custom);
                                        var doneStage=lastStage.find(function(k){ var kl=k.toLowerCase(); return kl==="delivered"||kl==="completed"||kl==="done"||kl==="issued"||kl==="generated"; })||lastStage[lastStage.length-2]||"Delivered";
                                        updStatus(s.id,doneStage);
                                      }} style={{background:"#f0fdf4",color:"#16a34a",border:"1.5px solid #bbf7d0",borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
                                        Mark Done
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      );
                    })
                }
              </div>
            );
          })()}

          {tab==="payments"&&(
            <div>
              {/* Search + Toggle row */}
              <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:14}}>
                <div style={{position:"relative",flex:1,maxWidth:320}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9fb0c8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input value={paySearch} onChange={function(e){ setPaySearch(e.target.value); }} placeholder="Search by name, mobile or service..." style={{...inp,paddingLeft:32,background:"#fff"}} />
                  {paySearch&&<button onClick={function(){ setPaySearch(""); }} style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#9fb0c8",lineHeight:1}}>x</button>}
                </div>
                <div style={{display:"flex",gap:6}}>
                  {["All","Pending","Cleared"].map(function(f){
                    return (
                      <button key={f} onClick={function(){ setPaySearch(f==="All"?"":f==="Pending"?"__pending":"__cleared"); }} style={{padding:"7px 14px",borderRadius:8,border:"1.5px solid",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",background:(f==="All"&&!paySearch)||(f==="Pending"&&paySearch==="__pending")||(f==="Cleared"&&paySearch==="__cleared")?"#1e40af":"#fff",color:(f==="All"&&!paySearch)||(f==="Pending"&&paySearch==="__pending")||(f==="Cleared"&&paySearch==="__cleared")?"#fff":"#6b7280",borderColor:(f==="All"&&!paySearch)||(f==="Pending"&&paySearch==="__pending")||(f==="Cleared"&&paySearch==="__cleared")?"#1e40af":"#dbe4f0"}}>{f}</button>
                    );
                  })}
                </div>
                <button onClick={function(){ setShowPayFin(function(x){ return !x; }); }} style={{...btnG,padding:"7px 14px",fontSize:12,marginLeft:"auto"}}>{showPayFin?"Hide Amounts":"Show Amounts"}</button>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:18}}>
                <KPI label="Total Collected" value={fmt(totalRev)} sub="All payments" color="#2563eb" blur={!showPayFin} />
                <KPI label="Pending Balance" value={fmt(totalPend)} sub="Outstanding" color="#ef4444" blur={!showPayFin} />
                <KPI label="Cash" value={fmt(insts.filter(function(i){ return i.mode==="Cash"; }).reduce(function(s,i){ return s+i.amt; },0))} sub="Cash only" color="#10b981" blur={!showPayFin} />
              </div>

              {/* Pending Payment Approvals */}
              {payRequests.filter(function(r){ return r.status==="Pending"; }).length>0&&(
                <div style={{background:"#fffbeb",borderRadius:14,border:"2px solid #fde68a",padding:"16px 20px",marginBottom:18}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                    <div style={{width:28,height:28,borderRadius:8,background:"#f59e0b",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    </div>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:"#92400e"}}>Pending Payment Approvals</div>
                      <div style={{fontSize:11,color:"#b45309"}}>{payRequests.filter(function(r){ return r.status==="Pending"; }).length} request(s) waiting for your approval</div>
                    </div>
                  </div>
                  {payRequests.filter(function(r){ return r.status==="Pending"; }).map(function(req){
                    return (
                      <div key={req.id} style={{background:"#fff",borderRadius:12,border:"1.5px solid #fde68a",padding:"14px 16px",marginBottom:10}}>
                        <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                          <Av name={req.cname} size={36} />
                          <div style={{flex:1}}>
                            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                              <span style={{fontSize:13,fontWeight:700,color:"#1a2942"}}>{req.cname}</span>
                              <span style={{fontSize:12,fontWeight:700,color:"#2563eb",background:"#eff6ff",padding:"2px 9px",borderRadius:999,border:"1px solid #bfdbfe"}}>
                                +91 {(custs.find(function(c){ return c.id===req.cid; })||{}).mobile||"-"}
                              </span>
                            </div>
                            <div style={{fontSize:11,color:"#8fa0b8",marginBottom:6,marginTop:2}}>{req.svc}</div>
                            <div style={{display:"flex",gap:10,marginBottom:8,flexWrap:"wrap"}}>
                              <span style={{fontSize:12,fontWeight:700,color:"#1a2942"}}>Amount: <span style={{color:"#2563eb"}}>{fmt(req.amt)}</span></span>
                              <span style={{fontSize:12,fontWeight:600,color:"#6b7280"}}>Mode: {req.mode}</span>
                              <span style={{fontSize:11,color:"#8fa0b8"}}>{req.date} at {req.time}</span>
                            </div>
                            {req.screenshotUrl&&(
                              <a href={req.screenshotUrl} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,fontWeight:700,color:"#2563eb",background:"#eff6ff",padding:"4px 10px",borderRadius:7,textDecoration:"none",marginBottom:10,border:"1px solid #bfdbfe"}}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                View Screenshot
                              </a>
                            )}
                            <div style={{display:"flex",gap:8}}>
                              <button onClick={function(){
                                var now=new Date();
                                var tm=String(now.getHours()).padStart(2,"0")+":"+String(now.getMinutes()).padStart(2,"0");
                                setPays(function(p){ return p.map(function(pm){ return pm.id===req.pid?Object.assign({},pm,{recv:pm.recv+req.amt,pend:pm.pend-req.amt}):pm; }); });
                                setInsts(function(p){ return p.concat([{id:"I"+String(insts.length+1).padStart(3,"0"),pid:req.pid,cid:req.cid,cname:req.cname,svc:req.svc,amt:req.amt,mode:req.mode,date:TODAY,time:tm,note:"Online - Approved"}]); });
                                setPayRequests(function(p){ return p.map(function(r){ return r.id===req.id?Object.assign({},r,{status:"Approved"}):r; }); });
                              }} style={{...btnP,padding:"7px 18px",fontSize:12}}>
                                Approve
                              </button>
                              <button onClick={function(){
                                setPayRequests(function(p){ return p.map(function(r){ return r.id===req.id?Object.assign({},r,{status:"Rejected"}):r; }); });
                              }} style={{background:"#fee2e2",color:"#ef4444",border:"1.5px solid #fecaca",borderRadius:9,padding:"7px 18px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {pays.filter(function(p){
                if(!paySearch) return true;
                if(paySearch==="__pending") return p.pend>0;
                if(paySearch==="__cleared") return p.pend===0;
                var q=paySearch.toLowerCase();
                var cust=custs.find(function(c){ return c.id===p.cid; });
                var mobile=cust?cust.mobile:"";
                return p.cname.toLowerCase().indexOf(q)>=0 || p.svc.toLowerCase().indexOf(q)>=0 || p.cid.toLowerCase().indexOf(q)>=0 || mobile.indexOf(q)>=0;
              }).map(function(p){
                var pi=insts.filter(function(i){ return i.pid===p.id; });
                var pct=Math.round(p.recv/p.total*100);
                return (
                  <div key={p.id} style={{background:"#fff",borderRadius:14,border:"1.5px solid "+(payRequests.find(function(r){ return r.pid===p.id&&r.status==="Pending"; })?"#fde68a":"#dbe4f0"),marginBottom:12,overflow:"hidden"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:pi.length?"1px solid #f0f4fa":"none"}}>
                      <Av name={p.cname} size={30} />
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:600,color:"#1a2942"}}>{p.cname}</div>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
                          <span style={{fontSize:11,color:"#8fa0b8"}}>{p.svc}</span>
                          {payRequests.find(function(r){ return r.pid===p.id&&r.status==="Pending"; })&&(
                            <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:10,fontWeight:700,color:"#92400e",background:"#fef3c7",padding:"2px 8px",borderRadius:999,border:"1px solid #fde68a"}}>
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                              Approval Pending
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{textAlign:"center",minWidth:55}}><div style={{fontSize:10,color:"#8fa0b8"}}>Total</div><div style={{fontSize:13,fontWeight:700,filter:showPayFin?"none":"blur(6px)"}}>{fmt(p.total)}</div></div>
                      <div style={{textAlign:"center",minWidth:55}}><div style={{fontSize:10,color:"#8fa0b8"}}>Paid</div><div style={{fontSize:13,fontWeight:700,color:"#16a34a",filter:showPayFin?"none":"blur(6px)"}}>{fmt(p.recv)}</div></div>
                      <div style={{textAlign:"center",minWidth:55}}><div style={{fontSize:10,color:"#8fa0b8"}}>Due</div><div style={{fontSize:13,fontWeight:700,color:p.pend>0?"#ef4444":"#16a34a",filter:showPayFin?"none":"blur(6px)"}}>{p.pend>0?fmt(p.pend):"Done"}</div></div>
                      <div style={{minWidth:70}}><div style={{fontSize:10,color:"#8fa0b8",marginBottom:3}}>{pct}%</div><div style={{height:5,borderRadius:999,background:"#f0f4fa"}}><div style={{height:"100%",borderRadius:999,width:pct+"%",background:pct===100?"#16a34a":"#f97316"}}></div></div></div>
                      <div style={{display:"flex",gap:5}}>
                        {p.pend>0&&<button onClick={function(){ setInstM(p.id); setNi({amt:"",mode:"Cash",date:TODAY,note:""}); }} style={{...btnO,padding:"5px 9px",fontSize:11}}>+Pay</button>}
                        <button onClick={function(){ setEditFees({id:p.id,val:String(p.total)}); }} title="Edit Total Fees" style={{...btnG,padding:"5px 9px",fontSize:11}}>Edit Fees</button>
                        <button onClick={function(){ setReceipt(p); }} style={{...btnP,padding:"5px 9px",fontSize:11}}>Rcpt</button>
                      </div>
                    </div>

                    {/* Inline Edit Fees */}
                    {editFees&&editFees.id===p.id&&(
                      <div style={{padding:"10px 16px",background:"#fffbeb",borderTop:"1px solid #fde68a",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                        <div style={{fontSize:12,fontWeight:700,color:"#92400e"}}>Edit Total Fees:</div>
                        <div style={{fontSize:11,color:"#8fa0b8"}}>Current: {fmt(p.total)} - Paid: {fmt(p.recv)}</div>
                        <input type="number" value={editFees.val} onChange={function(e){ setEditFees(Object.assign({},editFees,{val:e.target.value})); }} style={{...inp,width:120,padding:"5px 10px",fontSize:13,fontWeight:700,textAlign:"center"}} />
                        {editFees.val&&Number(editFees.val)>0&&(
                          <div style={{fontSize:12,color:Number(editFees.val)-p.recv>0?"#ef4444":"#16a34a",fontWeight:700}}>
                            New balance: {fmt(Math.max(0,Number(editFees.val)-p.recv))}
                            {Number(editFees.val)<p.recv&&<span style={{color:"#ef4444"}}> (Warning: less than amount already paid!)</span>}
                          </div>
                        )}
                        <div style={{display:"flex",gap:6,marginLeft:"auto"}}>
                          <button onClick={function(){
                            var newTotal=Number(editFees.val);
                            if(!newTotal||newTotal<=0){ alert("Enter valid amount"); return; }
                            var newPend=Math.max(0,newTotal-p.recv);
                            setPays(function(prev){ return prev.map(function(pm){ return pm.id===p.id?Object.assign({},pm,{total:newTotal,pend:newPend}):pm; }); });
                            setEditFees(null);
                          }} style={{...btnP,padding:"5px 16px",fontSize:12}}>Save</button>
                          <button onClick={function(){ setEditFees(null); }} style={{...btnG,padding:"5px 12px",fontSize:12}}>Cancel</button>
                        </div>
                      </div>
                    )}
                    {pi.length>0&&(
                      <div style={{padding:"8px 16px 10px"}}>
                        {pi.map(function(inst,idx){
                          return (
                            <div key={inst.id} style={{display:"flex",alignItems:"center",gap:10,padding:"5px 8px",background:"#f9fbff",borderRadius:7,marginBottom:4}}>
                              <div style={{width:18,height:18,borderRadius:"50%",background:"#e0e7ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#4338ca"}}>{"#"+(idx+1)}</div>
                              <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:"#1a2942",filter:showPayFin?"none":"blur(6px)"}}>{fmt(inst.amt)} <span style={{fontSize:10,color:"#8fa0b8"}}>{inst.note}</span></div><div style={{fontSize:10,color:"#8fa0b8"}}>{inst.date}{inst.time?" at "+inst.time:""}</div></div>
                              <span style={{fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:999,background:"#ede9fe",color:"#7c3aed"}}>{inst.mode}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {tab==="documents"&&(
            <div>
              <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
                <button onClick={function(){ setDocF("All"); }} style={{padding:"5px 14px",borderRadius:999,border:"1.5px solid",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",background:docF==="All"?"#1e40af":"#fff",color:docF==="All"?"#fff":"#6b7280",borderColor:docF==="All"?"#1e40af":"#dbe4f0"}}>All</button>
                {docTypes.map(function(f){ return <button key={f} onClick={function(){ setDocF(f); }} style={{padding:"5px 14px",borderRadius:999,border:"1.5px solid",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",background:docF===f?"#1e40af":"#fff",color:docF===f?"#fff":"#6b7280",borderColor:docF===f?"#1e40af":"#dbe4f0"}}>{f}</button>; })}
                <button onClick={function(){ setShowDM(function(x){ return !x; }); }} style={{marginLeft:"auto",...btnG,padding:"5px 12px",fontSize:12}}>&#9881; Manage Types</button>
              </div>
              {showDM&&(
                <div style={{background:"#fff",borderRadius:12,border:"1.5px solid #dbe4f0",padding:"14px",marginBottom:14}}>
                  <div style={{display:"flex",gap:8,marginBottom:10}}>
                    <input value={newDT} onChange={function(e){ setNewDT(e.target.value); }} placeholder="Add new type..." style={{...inp,flex:1,fontSize:12}} />
                    <button onClick={function(){ if(newDT.trim()&&!docTypes.includes(newDT.trim())){ setDocTypes(function(p){ return p.concat([newDT.trim()]); }); setNewDT(""); } }} style={{...btnP,padding:"7px 14px",fontSize:12}}>+ Add</button>
                  </div>
                  {docTypes.map(function(t,i){
                    return (
                      <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:"#f8faff",borderRadius:7,marginBottom:4}}>
                        {editDT&&editDT.i===i
                          ? <span style={{display:"flex",gap:6,flex:1}}><input autoFocus value={editDT.v} onChange={function(e){ setEditDT(Object.assign({},editDT,{v:e.target.value})); }} style={{...inp,flex:1,fontSize:12,padding:"4px 8px"}} /><button onClick={function(){ setDocTypes(function(p){ return p.map(function(d,j){ return j===i?editDT.v.trim():d; }); }); setEditDT(null); }} style={{background:"#2563eb",color:"#fff",border:"none",borderRadius:6,padding:"4px 9px",fontSize:12,fontWeight:700,cursor:"pointer"}}>Save</button><button onClick={function(){ setEditDT(null); }} style={{background:"#f0f4fa",color:"#6b7280",border:"none",borderRadius:6,padding:"4px 8px",fontSize:12,cursor:"pointer"}}>x</button></span>
                          : <span style={{display:"flex",alignItems:"center",gap:8,flex:1}}><span style={{flex:1,fontSize:13,fontWeight:600,color:"#1a2942"}}>{t}</span><span style={{fontSize:10,color:"#8fa0b8"}}>{docs.filter(function(d){ return d.type===t; }).length}</span><button onClick={function(){ setEditDT({i:i,v:t}); }} style={{background:"none",border:"none",cursor:"pointer",fontSize:14,padding:"1px 3px"}}>&#9998;</button><button onClick={function(){ if(docs.some(function(d){ return d.type===t; })){ alert(t+" has documents."); return; } { setDocTypes(function(p){ return p.filter(function(_,j){ return j!==i; }); }); if(docF===t) setDocF("All"); } }} style={{background:"none",border:"none",cursor:"pointer",color:"#ef4444",padding:"1px 3px"}}>x</button></span>
                        }
                      </div>
                    );
                  })}
                </div>
              )}
              {docs.filter(function(d){ return docF==="All"||d.type===docF; }).length===0
                ? <div style={{background:"#fff",borderRadius:14,border:"1.5px dashed #dbe4f0",padding:"48px",textAlign:"center"}}><div style={{fontSize:15,fontWeight:600,color:"#374151",marginBottom:8}}>No documents yet</div><button onClick={function(){ setModal("doc"); }} style={btnP}>+ Upload Document</button></div>
                : <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
                    {docs.filter(function(d){ return docF==="All"||d.type===docF; }).map(function(d){
                      return (
                        <div key={d.id} style={{background:"#fff",borderRadius:12,border:"1.5px solid #dbe4f0",padding:"14px"}}>
                          <div style={{fontSize:12.5,fontWeight:600,color:"#1a2942",marginBottom:3}}>{d.fileName}</div>
                          <div style={{fontSize:10,color:"#8fa0b8",marginBottom:2}}>{d.type}</div>
                          <div style={{fontSize:12,color:"#374151",marginBottom:2}}>{d.cname}</div>
                          <div style={{fontSize:11,color:"#8fa0b8",marginBottom:8}}>{d.svc} - {d.uploadedOn}</div>
                          {d.note&&<div style={{fontSize:11,color:"#6b7280",fontStyle:"italic",marginBottom:8}}>{d.note}</div>}
                          <div style={{display:"flex",gap:6,marginBottom:6}}>
                            {d.driveLink?<a href={d.driveLink} target="_blank" rel="noreferrer" style={{flex:1,textAlign:"center",padding:"6px",background:"#eff6ff",color:"#2563eb",borderRadius:7,fontSize:11,fontWeight:700,textDecoration:"none"}}>Open</a>:<span style={{flex:1,textAlign:"center",padding:"6px",background:"#f0f4fa",color:"#8fa0b8",borderRadius:7,fontSize:11,display:"block"}}>No link</span>}
                            <button onClick={function(){ setDocs(function(p){ return p.filter(function(x){ return x.id!==d.id; }); }); }} style={{padding:"6px 9px",background:"#fef2f2",color:"#ef4444",border:"none",borderRadius:7,fontSize:11,cursor:"pointer"}}>Del</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
              }
            </div>
          )}

          {tab==="followups"&&(
            <div>
              {/* KPI row - only show non-zero */}
              <div style={{display:"flex",gap:14,marginBottom:18,flexWrap:"wrap"}}>
                {[
                  {label:"Total Follow-ups", value:followups.length, sub:"All reminders", color:"#8b5cf6"},
                  {label:"Overdue", value:followups.filter(function(f){ return f.status==="Pending"&&f.due<TODAY; }).length, sub:"Past due date", color:"#ef4444"},
                  {label:"Due Today", value:followups.filter(function(f){ return f.status==="Pending"&&f.due===TODAY; }).length, sub:"Today", color:"#f97316"},
                  {label:"Completed", value:followups.filter(function(f){ return f.status==="Done"; }).length, sub:"Resolved", color:"#16a34a"}
                ].filter(function(k){ return k.value>0; }).map(function(k){
                  return <KPI key={k.label} label={k.label} value={k.value} sub={k.sub} color={k.color} />;
                })}
              </div>

              {/* Overdue alert */}
              {followups.filter(function(f){ return f.status==="Pending"&&f.due<TODAY; }).length>0&&(
                <div style={{background:"#fff5f5",border:"1.5px solid #fecaca",borderRadius:12,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:36,height:36,borderRadius:10,background:"#fee2e2",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>!</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:"#dc2626"}}>
                      {followups.filter(function(f){ return f.status==="Pending"&&f.due<TODAY; }).length} overdue follow-up(s) need attention!
                    </div>
                    <div style={{fontSize:11,color:"#f87171"}}>These customers are waiting - please call or WhatsApp them today.</div>
                  </div>
                </div>
              )}

              {/* Two columns: Pending | Done */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>

                {/* Pending */}
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:"#1a2942",marginBottom:12}}>
                    Pending
                    <span style={{marginLeft:8,fontSize:11,fontWeight:600,background:"#f5f3ff",color:"#7c3aed",padding:"2px 8px",borderRadius:999}}>{followups.filter(function(f){ return f.status==="Pending"; }).length}</span>
                  </div>
                  {followups.filter(function(f){ return f.status==="Pending"; }).length===0
                    ? <div style={{background:"#f0fdf4",borderRadius:12,padding:"24px",textAlign:"center",color:"#16a34a",fontSize:13,fontWeight:600}}>All caught up!</div>
                    : followups
                        .filter(function(f){ return f.status==="Pending"; })
                        .sort(function(a,b){ return a.due>b.due?1:-1; })
                        .map(function(f){
                          var isOverdue = f.due < TODAY;
                          var isDueToday = f.due === TODAY;
                          var cust = custs.find(function(c){ return c.id===f.cid; });
                          return (
                            <div key={f.id} style={{background:"#fff",borderRadius:12,border:"1.5px solid "+(isOverdue?"#fecaca":isDueToday?"#fed7aa":"#dbe4f0"),padding:"14px 16px",marginBottom:10,boxShadow:"0 2px 8px rgba(0,30,80,.04)"}}>
                              <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                                <div style={{width:36,height:36,borderRadius:10,background:isOverdue?"#fee2e2":isDueToday?"#fff7ed":"#f5f3ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>
                                  {isOverdue?"!":isDueToday?"*":"R"}
                                </div>
                                <div style={{flex:1}}>
                                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                                    <span style={{fontSize:13,fontWeight:700,color:"#1a2942"}}>{f.cname}</span>
                                    <span style={{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:999,background:f.priority==="High"?"#fee2e2":"#f0f4fa",color:f.priority==="High"?"#ef4444":"#6b7280"}}>{f.priority}</span>
                                  </div>
                                  <div style={{fontSize:11,color:"#8fa0b8",marginBottom:4}}>{f.svc}</div>
                                  <div style={{fontSize:12.5,color:"#374151",marginBottom:8,lineHeight:1.4}}>{f.note}</div>
                                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                                    <span style={{fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:999,background:isOverdue?"#fee2e2":isDueToday?"#fff7ed":"#f0f4fa",color:isOverdue?"#dc2626":isDueToday?"#c2410c":"#6b7280"}}>
                                      {isOverdue?"Overdue: ":isDueToday?"Today: ":"Due: "}{f.due}
                                    </span>
                                    {cust&&(
                                      <a href={"https://wa.me/91"+cust.mobile+"?text=Dear+"+f.cname+",+this+is+a+reminder+regarding+your+"+f.svc+"+application.+"+f.note+"+-+Ashirwad+Multiservices"} target="_blank" rel="noreferrer" style={{fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:999,background:"#dcfce7",color:"#16a34a",textDecoration:"none"}}>WA Remind</a>
                                    )}
                                    {cust&&(
                                      <a href={"tel:"+cust.mobile} style={{fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:999,background:"#eff6ff",color:"#2563eb",textDecoration:"none"}}>Call</a>
                                    )}
                                  </div>
                                </div>
                                <button onClick={function(){ setFollowups(function(p){ return p.map(function(x){ return x.id===f.id?Object.assign({},x,{status:"Done"}):x; }); }); }} style={{background:"#f0fdf4",color:"#16a34a",border:"1px solid #bbf7d0",borderRadius:7,padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>Done</button>
                              </div>
                            </div>
                          );
                        })
                  }
                </div>

                {/* Done */}
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:"#1a2942",marginBottom:12}}>
                    Completed
                    <span style={{marginLeft:8,fontSize:11,fontWeight:600,background:"#dcfce7",color:"#16a34a",padding:"2px 8px",borderRadius:999}}>{followups.filter(function(f){ return f.status==="Done"; }).length}</span>
                  </div>
                  {followups.filter(function(f){ return f.status==="Done"; }).map(function(f){
                    return (
                      <div key={f.id} style={{background:"#f9fbff",borderRadius:12,border:"1.5px solid #e8eef8",padding:"12px 14px",marginBottom:8,opacity:.7}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{width:28,height:28,borderRadius:8,background:"#dcfce7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>v</div>
                          <div style={{flex:1}}>
                            <div style={{fontSize:13,fontWeight:600,color:"#374151",textDecoration:"line-through"}}>{f.cname}</div>
                            <div style={{fontSize:11,color:"#8fa0b8"}}>{f.svc} - {f.due}</div>
                            <div style={{fontSize:11,color:"#9fb0c8",marginTop:2}}>{f.note}</div>
                          </div>
                          <button onClick={function(){ if(true) setFollowups(function(p){ return p.filter(function(x){ return x.id!==f.id; }); }); }} style={{background:"none",border:"none",cursor:"pointer",color:"#fca5a5",fontSize:13,padding:"2px 4px"}}>x</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {tab==="reports"&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
              <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #dbe4f0",padding:"20px 24px"}}>
                <div style={{fontSize:14,fontWeight:700,color:"#1a2942",marginBottom:14}}>Collection Report</div>
                {[["Total Collected",fmt(totalRev)],["Cash",fmt(insts.filter(function(i){ return i.mode==="Cash"; }).reduce(function(s,i){ return s+i.amt; },0))],["UPI",fmt(insts.filter(function(i){ return i.mode==="UPI"; }).reduce(function(s,i){ return s+i.amt; },0))],["Pending",fmt(totalPend)]].map(function(row){
                  return <div key={row[0]} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f5f8ff"}}><span style={{fontSize:13,color:"#6b7280",fontWeight:600}}>{row[0]}</span><span style={{fontSize:13,fontWeight:700,filter:showFin?"none":"blur(6px)"}}>{row[1]}</span></div>;
                })}
              </div>
              <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #dbe4f0",padding:"20px 24px"}}>
                <div style={{fontSize:14,fontWeight:700,color:"#1a2942",marginBottom:14}}>Service Status</div>
                {[["Pending",svcs.filter(function(s){ return s.status==="Pending"; }).length,"#f59e0b"],["In Process",svcs.filter(function(s){ return s.status!=="Pending"&&s.status!=="Completed"&&s.status!=="Delivered"&&s.status!=="Rejected"; }).length,"#2563eb"],["Completed",svcs.filter(function(s){ return s.status==="Completed"||s.status==="Delivered"; }).length,"#16a34a"],["Rejected",svcs.filter(function(s){ return s.status==="Rejected"; }).length,"#ef4444"]].map(function(row){
                  return <div key={row[0]} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #f5f8ff"}}><span style={{fontSize:13,color:"#6b7280",fontWeight:600}}>{row[0]}</span><span style={{fontSize:18,fontWeight:700,color:row[2]}}>{row[1]}</span></div>;
                })}
              </div>
            </div>
          )}

          {tab==="staff"&&(
            <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #dbe4f0",overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr style={{background:"#f5f8ff",borderBottom:"1.5px solid #dbe4f0"}}>{["Name","Mobile","Role","Username","Status","Action"].map(function(h){ return <th key={h} style={{padding:"9px 14px",textAlign:"left",fontSize:10,fontWeight:600,color:"#9fb0c8",textTransform:"uppercase"}}>{h}</th>; })}</tr></thead>
                <tbody>
                  {staff.map(function(s){
                    return (
                      <tr key={s.id} style={{borderBottom:"1px solid #f5f8ff"}}>
                        <td style={{padding:"10px 14px"}}><div style={{display:"flex",alignItems:"center",gap:10}}><Av name={s.name} size={28} /><div style={{fontSize:13,fontWeight:600,color:"#1a2942"}}>{s.name}</div></div></td>
                        <td style={{padding:"10px 14px",fontSize:13,color:"#374151"}}>{s.mobile}</td>
                        <td style={{padding:"10px 14px"}}><span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:999,background:"#eff6ff",color:"#2563eb"}}>{s.role}</span></td>
                        <td style={{padding:"10px 14px",fontSize:12,color:"#8fa0b8"}}>{s.username}</td>
                        <td style={{padding:"10px 14px"}}><span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:999,background:s.active?"#dcfce7":"#fee2e2",color:s.active?"#16a34a":"#ef4444"}}>{s.active?"Active":"Inactive"}</span></td>
                        <td style={{padding:"10px 14px"}}><div style={{display:"flex",gap:6}}><button onClick={function(){ setStaff(function(p){ return p.map(function(m){ return m.id===s.id?Object.assign({},m,{active:!m.active}):m; }); }); }} style={{padding:"4px 8px",background:"#f0f4fa",border:"none",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer"}}>{s.active?"Disable":"Enable"}</button><button onClick={function(){ if(true) setStaff(function(p){ return p.filter(function(m){ return m.id!==s.id; }); }); }} style={{padding:"4px 8px",background:"#fef2f2",color:"#ef4444",border:"none",borderRadius:6,fontSize:11,cursor:"pointer"}}>Del</button></div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {tab==="kiosk"&&(
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh",background:"linear-gradient(135deg,#0f1e3d,#1e40af)",borderRadius:16,padding:20}}>
              {kstep==="login"&&(
                <div style={{background:"rgba(255,255,255,.08)",borderRadius:18,padding:"26px 30px",width:"100%",maxWidth:320,border:"1.5px solid rgba(255,255,255,.12)",textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:700,color:"#fff",marginBottom:4}}>Customer Portal</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,.45)",marginBottom:18}}>Enter your mobile number</div>
                  <input value={km} onChange={function(e){ setKm(e.target.value.replace(/[^0-9]/g,"").slice(0,10)); }} placeholder="9876543210" style={{...inp,background:"rgba(255,255,255,.1)",border:"1.5px solid rgba(255,255,255,.2)",color:"#fff",textAlign:"center",fontSize:16,marginBottom:14}} />
                  <button onClick={function(){
                    var matches=custs.filter(function(c){ return c.mobile===km; });
                    if(matches.length===0){ alert("Not registered."); return; }
                    if(matches.length===1){
                      var s=localStorage.getItem("ash_pin_"+km+"_"+matches[0].id);
                      setKcust(matches[0]);
                      setKstep(s?"enter":"set");
                    } else {
                      setKmatches(matches);
                      setKstep("select");
                    }
                  }} style={{...btnO,width:"100%",padding:"12px",fontSize:14}}>Continue</button>
                </div>
              )}

              {/* Select person when multiple customers share same mobile */}
              {kstep==="select"&&(
                <div style={{background:"rgba(255,255,255,.08)",borderRadius:18,padding:"24px 28px",width:"100%",maxWidth:360,border:"1.5px solid rgba(255,255,255,.12)"}}>
                  <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:4,textAlign:"center"}}>Who are you?</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.45)",marginBottom:18,textAlign:"center"}}>Multiple accounts found for {km}</div>
                  {kmatches.map(function(c){
                    return (
                      <button key={c.id} onClick={function(){
                        var s=localStorage.getItem("ash_pin_"+km+"_"+c.id);
                        setKcust(c);
                        setKstep(s?"enter":"set");
                      }} style={{display:"flex",alignItems:"center",gap:12,width:"100%",background:"rgba(255,255,255,.07)",border:"1.5px solid rgba(255,255,255,.12)",borderRadius:12,padding:"12px 14px",marginBottom:10,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                        <Av name={c.name} size={38} />
                        <div>
                          <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>{c.name}</div>
                          <div style={{fontSize:11,color:"rgba(255,255,255,.45)"}}>{c.id} - Added {c.dateAdded}</div>
                          <div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginTop:2}}>{svcs.filter(function(s){ return s.cid===c.id; }).length} application(s)</div>
                        </div>
                      </button>
                    );
                  })}
                  <button onClick={function(){ setKstep("login"); setKmatches([]); }} style={{...btnG,width:"100%",padding:"9px",fontSize:12,marginTop:4}}>Back</button>
                </div>
              )}
              {kstep==="set"&&(
                <div style={{background:"rgba(255,255,255,.08)",borderRadius:18,padding:"26px 30px",width:"100%",maxWidth:320,border:"1.5px solid rgba(255,255,255,.12)",textAlign:"center"}}>
                  <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:14}}>Set 4-digit PIN</div>
                  <input type="password" value={knp} onChange={function(e){ setKnp(e.target.value.replace(/[^0-9]/g,"").slice(0,4)); }} placeholder="New PIN" style={{...inp,background:"rgba(255,255,255,.1)",border:"1.5px solid rgba(255,255,255,.2)",color:"#fff",marginBottom:10,textAlign:"center",fontSize:22}} />
                  <input type="password" value={kcp} onChange={function(e){ setKcp(e.target.value.replace(/[^0-9]/g,"").slice(0,4)); }} placeholder="Confirm PIN" style={{...inp,background:"rgba(255,255,255,.1)",border:"1.5px solid rgba(255,255,255,.2)",color:"#fff",marginBottom:14,textAlign:"center",fontSize:22}} />
                  <button onClick={function(){ if(knp.length!==4){ alert("Need 4 digits"); return; } if(knp!==kcp){ alert("PINs dont match"); setKcp(""); return; } localStorage.setItem("ash_pin_"+km+"_"+kcust.id,knp); setKstep("portal"); }} style={{...btnO,width:"100%",padding:"12px",marginBottom:8}}>Set PIN</button>
                  <button onClick={function(){ setKstep("login"); }} style={{...btnG,width:"100%",padding:"10px",fontSize:12}}>Back</button>
                </div>
              )}
              {kstep==="enter"&&(
                <div style={{background:"rgba(255,255,255,.08)",borderRadius:18,padding:"26px 30px",width:"100%",maxWidth:320,border:"1.5px solid rgba(255,255,255,.12)",textAlign:"center"}}>
                  <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:4}}>Enter PIN</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginBottom:14}}>{kcust&&kcust.name}</div>
                  <input type="password" value={kp} onChange={function(e){ setKp(e.target.value.replace(/[^0-9]/g,"").slice(0,4)); }} placeholder="PIN" style={{...inp,background:"rgba(255,255,255,.1)",border:"1.5px solid rgba(255,255,255,.2)",color:"#fff",marginBottom:14,textAlign:"center",fontSize:28,letterSpacing:8}} />
                  <button onClick={function(){ if(kp===localStorage.getItem("ash_pin_"+km+"_"+kcust.id)){ setKstep("portal"); } else { setKotpError("Wrong PIN. Try again."); setKp(""); } }} style={{...btnO,width:"100%",padding:"12px",marginBottom:8}}>Login</button>
                  {kotpError&&<div style={{fontSize:11,color:"#fca5a5",marginBottom:8}}>{kotpError}</div>}
                  <button onClick={function(){
                    var otp = String(Math.floor(100000+Math.random()*900000));
                    var otpKey=km+"_"+kcust.id;
                    setOtpStore(function(x){ var n=Object.assign({},x); n[otpKey]=otp; return n; });
                    setKstep("otp_verify");
                    setKotpInput("");
                    setKotpError("");
                    var msg = "Dear "+kcust.name+", your Ashirwad Multiservices PIN Reset OTP is: "+otp+". Valid for one-time use only. Do not share with anyone.";
                    if(API_CFG.wa_token&&API_CFG.wa_phone_id){
                      sendWA(km, msg).then(function(r){
                        if(r.ok){ setKotpError("OTP sent to your WhatsApp!"); }
                        else { setKotpError("OTP generated. Visit office to get it."); }
                      });
                    }
                  }} style={{background:"transparent",color:"rgba(249,115,22,.6)",border:"1px solid rgba(249,115,22,.2)",borderRadius:9,padding:"7px",width:"100%",fontSize:11,cursor:"pointer",fontFamily:"inherit",marginBottom:6}}>
                    {API_CFG.wa_token?"Forgot PIN - Send OTP via WhatsApp":"Forgot PIN - Request OTP"}
                  </button>
                  <button onClick={function(){ setKstep("login"); setKotpError(""); }} style={{...btnG,width:"100%",padding:"8px",fontSize:11}}>Change Number</button>
                </div>
              )}

              {/* OTP verification for PIN reset */}
              {kstep==="otp_verify"&&kcust&&(
                <div style={{background:"rgba(255,255,255,.08)",borderRadius:18,padding:"26px 30px",width:"100%",maxWidth:320,border:"1.5px solid rgba(255,255,255,.12)",textAlign:"center"}}>
                  <div style={{width:44,height:44,borderRadius:12,background:"rgba(249,115,22,.2)",border:"1px solid rgba(249,115,22,.3)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  </div>
                  <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:4}}>Enter OTP</div>
                  <div style={{background:"rgba(255,255,255,.05)",borderRadius:8,padding:"10px 12px",marginBottom:14,border:"1px solid rgba(255,255,255,.1)"}}>
                    <div style={{fontSize:12,fontWeight:600,color:"#fff",marginBottom:4}}>{kcust.name} - +91 {km}</div>
                    {API_CFG.wa_token
                      ? <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontSize:11,color:"#4ade80"}}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.18a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .5h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.77-1.77a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 15.5v1.42z"/></svg>
                          OTP sent to your WhatsApp
                        </div>
                      : <div style={{fontSize:10,color:"rgba(249,115,22,.7)"}}>Visit or call Ashirwad Multiservices to get your OTP</div>
                    }
                  </div>
                  <input value={kotpInput} onChange={function(e){ setKotpInput(e.target.value.replace(/[^0-9]/g,"").slice(0,6)); setKotpError(""); }} placeholder="Enter 6-digit OTP" style={{...inp,background:"rgba(255,255,255,.1)",border:"1.5px solid rgba(255,255,255,.2)",color:"#fff",marginBottom:10,textAlign:"center",fontSize:20,letterSpacing:6}} />
                  {kotpError&&<div style={{fontSize:11,color:"#fca5a5",marginBottom:8}}>{kotpError}</div>}
                  <button onClick={function(){
                    var saved=otpStore[km+"_"+kcust.id]||"";
                    if(kotpInput===saved){
                      setOtpStore(function(x){ var n=Object.assign({},x); delete n[km+"_"+kcust.id]; return n; }); localStorage.removeItem("ash_pin_"+km+"_"+kcust.id);
                      setKstep("set");
                      setKnp(""); setKcp("");
                      setKotpInput(""); setKotpError("");
                    } else {
                      setKotpError("Wrong OTP. Please check and try again.");
                    }
                  }} style={{...btnO,width:"100%",padding:"12px",marginBottom:8}}>Verify OTP</button>
                  <button onClick={function(){ setKstep("enter"); setKotpInput(""); setKotpError(""); }} style={{...btnG,width:"100%",padding:"8px",fontSize:11}}>Back</button>
                </div>
              )}
              {kstep==="portal"&&kcust&&(
                <div style={{width:"100%",maxWidth:580}}>
                  <div style={{background:"rgba(255,255,255,.08)",borderRadius:14,padding:"14px 18px",marginBottom:14,display:"flex",alignItems:"center",gap:12}}>
                    <Av name={kcust.name} size={38} />
                    <div style={{flex:1}}><div style={{fontSize:16,fontWeight:700,color:"#fff"}}>Welcome, {kcust.name.split(" ")[0]}!</div><div style={{fontSize:11,color:"rgba(255,255,255,.45)"}}>{kcust.id}</div></div>
                    <button onClick={function(){ setKstep("login"); setKm(""); setKp(""); setKnp(""); setKcp(""); setKcust(null); setKmatches([]); }} style={{background:"rgba(239,68,68,.2)",color:"#fca5a5",border:"1px solid rgba(239,68,68,.3)",borderRadius:8,padding:"6px 14px",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>Logout</button>
                  </div>
                  <div style={{background:"rgba(255,255,255,.06)",borderRadius:12,padding:"14px",marginBottom:12,border:"1px solid rgba(255,255,255,.1)"}}>
                    <div style={{fontWeight:700,fontSize:13,color:"#fff",marginBottom:10}}>My Applications</div>
                    {svcs.filter(function(s){ return s.cid===kcust.id; }).map(function(s){
                      var stages=getStages(s.svc,custom);
                      var ci=stages.indexOf(s.status);
                      var pct=stages.length>1?Math.round(Math.max(0,ci)/(stages.length-1)*100):0;
                      return (
                        <div key={s.id} style={{background:"rgba(255,255,255,.05)",borderRadius:10,padding:"10px",marginBottom:8}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                            <div><div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{s.svc}</div><div style={{fontSize:10,color:"rgba(255,255,255,.4)"}}>{s.appNo||"-"}</div></div>
                            <span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:999,background:"rgba(249,115,22,.2)",color:"#fb923c"}}>{s.status}</span>
                          </div>
                          <div style={{height:4,borderRadius:999,background:"rgba(255,255,255,.1)",marginBottom:5}}><div style={{height:"100%",borderRadius:999,width:pct+"%",background:"#f97316"}}></div></div>
                          <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                            {stages.map(function(st,si){
                              return <span key={st} style={{fontSize:9,padding:"2px 6px",borderRadius:999,background:si===ci?"rgba(249,115,22,.3)":si<ci?"rgba(74,222,128,.15)":"rgba(255,255,255,.05)",color:si===ci?"#fb923c":si<ci?"#4ade80":"rgba(255,255,255,.3)",whiteSpace:"nowrap"}}>{st}</span>;
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                    <div style={{background:"rgba(255,255,255,.06)",borderRadius:12,border:"1px solid rgba(255,255,255,.1)",padding:"14px"}}>
                      <div style={{fontWeight:700,fontSize:13,color:"#fff",marginBottom:10}}>My Documents</div>
                      {(function(){
                        var totalDue = pays.filter(function(p){ return p.cid===kcust.id; }).reduce(function(s,p){ return s+p.pend; },0);
                        var isLocked = totalDue > 0;
                        return (
                          <div>
                            {isLocked&&(
                              <div style={{background:"rgba(239,68,68,.15)",border:"1px solid rgba(239,68,68,.3)",borderRadius:8,padding:"8px 10px",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                                <div>
                                  <div style={{fontSize:11,fontWeight:700,color:"#fca5a5"}}>Documents Locked</div>
                                  <div style={{fontSize:9,color:"rgba(255,255,255,.4)"}}>Clear due amount of {fmt(totalDue)} to unlock</div>
                                </div>
                              </div>
                            )}
                            {docs.filter(function(d){ return d.cid===kcust.id; }).length===0
                              ? <div style={{fontSize:12,color:"rgba(255,255,255,.3)",textAlign:"center",padding:"12px 0"}}>No documents yet</div>
                              : docs.filter(function(d){ return d.cid===kcust.id; }).map(function(d){
                                var docPay = pays.find(function(p){ return p.sid===d.sid; });
                                var docDue = docPay ? docPay.pend : 0;
                                var docLocked = docDue > 0;
                                return (
                                  <div key={d.id} style={{padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
                                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:1}}>
                                      <div style={{fontSize:12,fontWeight:600,color:docLocked?"rgba(255,255,255,.4)":"#fff",flex:1}}>{d.fileName}</div>
                                      {docLocked&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>}
                                    </div>
                                    <div style={{fontSize:10,color:"rgba(255,255,255,.4)",marginBottom:5}}>{d.svc||"-"}</div>
                                    {docLocked
                                      ? <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 10px",background:"rgba(239,68,68,.1)",borderRadius:8,border:"1px solid rgba(239,68,68,.2)"}}>
                                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                                          <span style={{fontSize:11,color:"#fca5a5",fontWeight:600}}>Locked - Pay {fmt(docDue)} to unlock</span>
                                        </div>
                                      : d.driveLink
                                        ? <a href={d.driveLink} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"6px 10px",background:"rgba(37,99,235,.35)",color:"#93c5fd",borderRadius:8,fontSize:11,fontWeight:700,textDecoration:"none",border:"1px solid rgba(37,99,235,.4)"}}>
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                            Download - {d.type}
                                          </a>
                                        : <div style={{padding:"5px 10px",background:"rgba(255,255,255,.05)",color:"rgba(255,255,255,.3)",borderRadius:8,fontSize:11,textAlign:"center",border:"1px solid rgba(255,255,255,.08)"}}>
                                            {d.type} - Not available yet
                                          </div>
                                    }
                                  </div>
                                );
                              })
                            }
                          </div>
                        );
                      })()}
                    </div>
                    <div style={{background:"rgba(255,255,255,.06)",borderRadius:12,border:"1px solid rgba(255,255,255,.1)",padding:"14px"}}>
                      <div style={{fontWeight:700,fontSize:13,color:"#fff",marginBottom:10}}>My Payments</div>
                      {pays.filter(function(p){ return p.cid===kcust.id; }).map(function(p){
                        var pendingReq = payRequests.find(function(r){ return r.pid===p.id&&r.status==="Pending"; });
                        var allReqs = payRequests.filter(function(r){ return r.pid===p.id; }).slice().reverse();
                        return (
                          <div key={p.id} style={{padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
                            <div style={{fontSize:12,fontWeight:700,color:"#fff",marginBottom:4}}>{p.svc}</div>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                              <span style={{fontSize:10,color:"rgba(255,255,255,.5)"}}>Total: {fmt(p.total)}</span>
                              <span style={{fontSize:10,fontWeight:700,color:p.pend>0?"#fca5a5":"#4ade80"}}>{p.pend>0?"Due: "+fmt(p.pend):"Fully Paid"}</span>
                            </div>
                            {insts.filter(function(i){ return i.pid===p.id; }).map(function(inst,idx){
                              return (
                                <div key={inst.id} style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.05)",borderRadius:7,padding:"5px 8px",marginBottom:3,border:"1px solid rgba(255,255,255,.07)"}}>
                                  <div style={{width:16,height:16,borderRadius:"50%",background:"rgba(99,102,241,.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:"#a5b4fc",flexShrink:0}}>{"#"+(idx+1)}</div>
                                  <div style={{flex:1}}>
                                    <div style={{fontSize:11,fontWeight:700,color:"#4ade80"}}>{fmt(inst.amt)}</div>
                                    <div style={{fontSize:9,color:"rgba(255,255,255,.35)"}}>{inst.date}{inst.time?" at "+inst.time:""}</div>
                                  </div>
                                  <span style={{fontSize:9,fontWeight:600,padding:"2px 6px",borderRadius:999,background:"rgba(255,255,255,.08)",color:"rgba(255,255,255,.5)"}}>{inst.mode}</span>
                                </div>
                              );
                            })}
                            {/* All payment requests with status */}
                            {allReqs.map(function(req){
                              var isPending = req.status==="Pending";
                              var isApproved = req.status==="Approved";
                              var isRejected = req.status==="Rejected";
                              return (
                                <div key={req.id} style={{marginTop:6,borderRadius:8,padding:"8px 10px",display:"flex",alignItems:"flex-start",gap:8,
                                  background:isPending?"rgba(251,191,36,.1)":isApproved?"rgba(74,222,128,.1)":"rgba(239,68,68,.1)",
                                  border:"1px solid "+(isPending?"rgba(251,191,36,.3)":isApproved?"rgba(74,222,128,.3)":"rgba(239,68,68,.3)")
                                }}>
                                  {isPending&&<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
                                  {isApproved&&<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
                                  {isRejected&&<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
                                  <div style={{flex:1}}>
                                    <div style={{fontSize:11,fontWeight:700,color:isPending?"#fbbf24":isApproved?"#4ade80":"#fca5a5"}}>
                                      {isPending?"Awaiting Admin Approval":isApproved?"Payment Approved":"Payment Rejected"}
                                    </div>
                                    <div style={{fontSize:9,color:"rgba(255,255,255,.5)",marginTop:2}}>
                                      {fmt(req.amt)} via {req.mode} - {req.date} at {req.time}
                                    </div>
                                    {isRejected&&<div style={{fontSize:9,color:"rgba(239,68,68,.7)",marginTop:3}}>Please visit office or contact admin for assistance.</div>}
                                    {isApproved&&<div style={{fontSize:9,color:"rgba(74,222,128,.7)",marginTop:3}}>Payment recorded. Documents now unlocked.</div>}
                                  </div>
                                </div>
                              );
                            })}
                            {/* Upload screenshot button if due and no pending request */}
                            {p.pend>0&&!pendingReq&&(
                              <div style={{marginTop:8,background:"rgba(255,255,255,.04)",border:"1px dashed rgba(255,255,255,.15)",borderRadius:8,padding:"10px"}}>

                                {/* QR Code */}
                                {payQR&&(
                                  <div style={{textAlign:"center",marginBottom:12,background:"rgba(255,255,255,.06)",borderRadius:10,padding:"12px",border:"1px solid rgba(255,255,255,.1)"}}>
                                    <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.5)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Scan QR to Pay</div>
                                    <div style={{background:"#fff",borderRadius:10,padding:"10px",display:"inline-block"}}>
                                      <img src={payQR} alt="Payment QR" style={{width:140,height:140,objectFit:"contain",display:"block"}} />
                                    </div>
                                    <div style={{fontSize:12,fontWeight:700,color:"#fff",marginTop:8}}>Ashirwad Multiservices</div>
                                    <div style={{fontSize:10,color:"rgba(255,255,255,.4)",marginTop:2}}>Pay {fmt(p.pend)} and upload screenshot below</div>
                                  </div>
                                )}

                                <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.7)",marginBottom:6}}>Paid online? Upload screenshot for approval</div>
                                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:6}}>
                                  <div>
                                    <div style={{fontSize:9,color:"rgba(255,255,255,.4)",marginBottom:3}}>AMOUNT PAID</div>
                                    <input id={"kamt_"+p.id} type="number" placeholder={"Max "+fmt(p.pend)} style={{...inp,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.15)",color:"#fff",fontSize:12,padding:"6px 9px"}} />
                                  </div>
                                  <div>
                                    <div style={{fontSize:9,color:"rgba(255,255,255,.4)",marginBottom:3}}>PAYMENT MODE</div>
                                    <select id={"kmode_"+p.id} style={{...inp,background:"#1e3a6e",border:"1px solid rgba(255,255,255,.3)",color:"#fff",fontSize:12,padding:"6px 9px",WebkitAppearance:"none"}}>
                                      <option>UPI</option><option>Bank Transfer</option><option>Card</option>
                                    </select>
                                  </div>
                                </div>
                                <div style={{marginBottom:8}}>
                                  <div style={{fontSize:9,color:"rgba(255,255,255,.4)",marginBottom:3}}>SCREENSHOT / PROOF</div>
                                  <input type="file" accept=".jpg,.jpeg,.png,.pdf" id={"kss_"+p.id} style={{width:"100%",padding:"6px",borderRadius:7,border:"1px dashed rgba(255,255,255,.2)",fontSize:11,fontFamily:"inherit",background:"rgba(255,255,255,.05)",cursor:"pointer",color:"rgba(255,255,255,.6)",boxSizing:"border-box"}} />
                                </div>
                                <button onClick={function(){
                                  var amtEl=document.getElementById("kamt_"+p.id);
                                  var modeEl=document.getElementById("kmode_"+p.id);
                                  var ssEl=document.getElementById("kss_"+p.id);
                                  var amt=amtEl?Number(amtEl.value):0;
                                  if(!amt||amt<=0){ alert("Enter amount paid"); return; }
                                  if(amt>p.pend){ alert("Amount cannot exceed due: "+fmt(p.pend)); return; }
                                  var ssUrl="";
                                  if(ssEl&&ssEl.files&&ssEl.files[0]){ ssUrl=URL.createObjectURL(ssEl.files[0]); }
                                  var req={
                                    id:"PR"+String(payRequests.length+1).padStart(3,"0"),
                                    pid:p.id, cid:kcust.id, cname:kcust.name,
                                    svc:p.svc, amt:amt,
                                    mode:modeEl?modeEl.value:"UPI",
                                    screenshotUrl:ssUrl,
                                    date:TODAY,
                                    time:(function(){ var n=new Date(); return String(n.getHours()).padStart(2,"0")+":"+String(n.getMinutes()).padStart(2,"0"); })(),
                                    status:"Pending"
                                  };
                                  setPayRequests(function(prev){ return prev.concat([req]); });
                                  alert("Payment request submitted! Admin will verify and approve.");
                                }} style={{...btnO,width:"100%",padding:"8px",fontSize:12}}>
                                  Submit for Approval
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab==="settings"&&(
            <div>

              {/* QR Code Upload */}
              <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #dbe4f0",padding:"22px 26px",marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                  <div style={{width:34,height:34,borderRadius:10,background:"#f0fdf4",border:"1.5px solid #bbf7d0",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><rect x="19" y="14" width="2" height="2"/><rect x="14" y="19" width="2" height="2"/><rect x="18" y="18" width="3" height="3"/></svg>
                  </div>
                  <div>
                    <div style={{fontSize:15,fontWeight:700,color:"#1a2942"}}>Payment QR Code</div>
                    <div style={{fontSize:11,color:"#8fa0b8"}}>Upload your UPI / GPay / PhonePe QR - customers scan this in Kiosk to pay</div>
                  </div>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,alignItems:"start"}}>

                  {/* Upload side */}
                  <div>
                    <label style={lbl}>Upload QR Code Image</label>
                    <input type="file" accept=".jpg,.jpeg,.png,.gif,.webp" onChange={function(e){
                      var f=e.target.files[0]; if(!f) return;
                      var reader=new FileReader();
                      reader.onload=function(ev){ setPayQR(ev.target.result); };
                      reader.readAsDataURL(f);
                    }} style={{width:"100%",padding:"10px",borderRadius:9,border:"2px dashed #bbf7d0",fontSize:12,fontFamily:"inherit",background:"#f0fdf4",cursor:"pointer",boxSizing:"border-box",marginBottom:10}} />
                    <div style={{fontSize:11,color:"#8fa0b8",marginBottom:12}}>Supports JPG, PNG - Recommended size: 300x300px</div>
                    {payQR&&(
                      <button onClick={function(){ setPayQR(""); }} style={{background:"#fee2e2",color:"#ef4444",border:"none",borderRadius:8,padding:"7px 16px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Remove QR</button>
                    )}
                  </div>

                  {/* Preview side */}
                  <div style={{textAlign:"center"}}>
                    {payQR
                      ? <div>
                          <div style={{fontSize:11,fontWeight:700,color:"#16a34a",marginBottom:8,textTransform:"uppercase",letterSpacing:".05em"}}>Live Preview - Kiosk will show this</div>
                          <div style={{background:"#fff",borderRadius:14,padding:"16px",border:"2px solid #bbf7d0",display:"inline-block",boxShadow:"0 4px 16px rgba(0,0,0,.08)"}}>
                            <img src={payQR} alt="Payment QR" style={{width:160,height:160,objectFit:"contain",display:"block",borderRadius:8}} />
                            <div style={{fontSize:11,fontWeight:700,color:"#1a2942",marginTop:10}}>Ashirwad Multiservices</div>
                            <div style={{fontSize:10,color:"#8fa0b8",marginTop:2}}>Scan to pay via UPI</div>
                          </div>
                        </div>
                      : <div style={{background:"#f9fbff",borderRadius:12,padding:"30px 20px",border:"1.5px dashed #dbe4f0",color:"#c0ccd8"}}>
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{margin:"0 auto 8px",display:"block"}}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/></svg>
                          <div style={{fontSize:12}}>No QR uploaded yet</div>
                        </div>
                    }
                  </div>
                </div>
              </div>

              {/* API Config */}
              <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #dbe4f0",padding:"22px 26px"}}>
                <div style={{fontSize:16,fontWeight:700,color:"#1a2942",marginBottom:20}}>API Configuration</div>
              <div style={{marginBottom:20}}>
                <div style={{fontSize:13,fontWeight:700,color:"#f97316",marginBottom:10}}>MSG91 SMS</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div><label style={lbl}>Auth Key</label><input defaultValue="" placeholder="your_authkey" style={inp} /></div>
                  <div><label style={lbl}>Sender ID</label><input defaultValue="ASHIRW" placeholder="ASHIRW" style={inp} /></div>
                </div>
              </div>
              <div style={{borderTop:"1px solid #f0f4fa",paddingTop:18,marginBottom:20}}>
                <div style={{fontSize:13,fontWeight:700,color:"#16a34a",marginBottom:10}}>WhatsApp Business API</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div><label style={lbl}>Access Token</label><input defaultValue="" placeholder="EAAxxxxx..." style={inp} /></div>
                  <div><label style={lbl}>Phone Number ID</label><input defaultValue="" placeholder="106xxxxxxx" style={inp} /></div>
                </div>
              </div>
              <div style={{borderTop:"1px solid #f0f4fa",paddingTop:18}}>
                <div style={{fontSize:13,fontWeight:700,color:"#2563eb",marginBottom:10}}>EmailJS</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div><label style={lbl}>Service ID</label><input defaultValue="" placeholder="service_abc" style={inp} /></div>
                  <div><label style={lbl}>Template ID</label><input defaultValue="" placeholder="template_abc" style={inp} /></div>
                </div>
              </div>
            </div>
            </div>
          )}

        </div>
      </div>

      {modal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,30,80,.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <div style={{background:"#fff",borderRadius:18,padding:"24px 28px",width:460,boxShadow:"0 24px 80px rgba(0,30,80,.2)",maxHeight:"90vh",overflowY:"auto"}}>
            {modal==="cust"&&(
              <div>
                <div style={{fontSize:16,fontWeight:700,color:"#1a2942",marginBottom:4}}>Add Customer</div>
                <div style={{fontSize:12,color:"#8fa0b8",marginBottom:16}}>Fill details and add services in one go</div>

                {/* Name */}
                <div style={{marginBottom:11}}>
                  <label style={lbl}>Name *</label>
                  <input value={nc.name} onChange={function(e){ setNc(Object.assign({},nc,{name:e.target.value})); }} placeholder="Ramesh Patil" style={inp} />
                  {nc.name.length>=2&&(function(){
                    var matches=custs.filter(function(c){ return c.name.toLowerCase().indexOf(nc.name.toLowerCase())>=0; });
                    if(!matches.length) return null;
                    return (
                      <div style={{marginTop:6,background:"#fff7ed",borderRadius:8,border:"1.5px solid #fed7aa",padding:"8px 10px"}}>
                        <div style={{fontSize:10,fontWeight:700,color:"#c2410c",marginBottom:6,textTransform:"uppercase",letterSpacing:".05em"}}>Similar customers found - avoid duplicates!</div>
                        {matches.slice(0,3).map(function(c){
                          return (
                            <div key={c.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:"1px solid #fed7aa"}}>
                              <Av name={c.name} size={24} />
                              <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:"#1a2942"}}>{c.name}</div><div style={{fontSize:10,color:"#8fa0b8"}}>{c.mobile} - {c.id}</div></div>
                              <button onClick={function(){ setModal(null); setSelCust(c); setTab("customers"); }} style={{background:"#2563eb",color:"#fff",border:"none",borderRadius:6,padding:"3px 8px",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>View</button>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* Mobile */}
                <div style={{marginBottom:11}}>
                  <label style={lbl}>Mobile *</label>
                  <input value={nc.mob} onChange={function(e){ setNc(Object.assign({},nc,{mob:e.target.value.replace(/[^0-9]/g,"").slice(0,10)})); }} placeholder="9876543210" style={{...inp,borderColor:nc.mob.length>=10&&custs.find(function(c){ return c.mobile===nc.mob; })?"#f59e0b":""}} />
                  {nc.mob.length>=5&&(function(){
                    var matches=custs.filter(function(c){ return c.mobile.indexOf(nc.mob)>=0; });
                    if(!matches.length) return null;
                    var exactMatch=custs.find(function(c){ return c.mobile===nc.mob; });
                    return (
                      <div style={{marginTop:6,background:exactMatch?"#fffbeb":"#f0f9ff",borderRadius:8,border:"1.5px solid "+(exactMatch?"#fde68a":"#bae6fd"),padding:"8px 10px"}}>
                        <div style={{fontSize:10,fontWeight:700,color:exactMatch?"#92400e":"#0369a1",marginBottom:6,textTransform:"uppercase",letterSpacing:".05em"}}>{exactMatch?"Same mobile already registered - Family member?":"Similar mobile found"}</div>
                        {matches.slice(0,3).map(function(c){
                          return (
                            <div key={c.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:"1px solid rgba(0,0,0,.05)"}}>
                              <Av name={c.name} size={24} />
                              <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:"#1a2942"}}>{c.name}</div><div style={{fontSize:10,color:"#8fa0b8"}}>{c.mobile} - {c.id}</div></div>
                              <button onClick={function(){ setModal(null); setSelCust(c); setTab("customers"); }} style={{background:"#2563eb",color:"#fff",border:"none",borderRadius:6,padding:"3px 8px",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>View</button>
                            </div>
                          );
                        })}
                        {exactMatch&&<div style={{marginTop:6,fontSize:10,color:"#92400e",background:"#fef9c3",borderRadius:6,padding:"5px 8px"}}>You can still proceed if this is a different person (e.g. family member).</div>}
                      </div>
                    );
                  })()}
                </div>

                {/* Email */}
                <div style={{marginBottom:14}}><label style={lbl}>Email</label><input value={nc.email||""} onChange={function(e){ setNc(Object.assign({},nc,{email:e.target.value})); }} placeholder="email@example.com" style={inp} /></div>

                {/* Services */}
                {(nc.svcList||[]).map(function(item,idx){
                  function updNcItem(changes){
                    var newList=(nc.svcList||[]).map(function(x,i){ return i===idx?Object.assign({},x,changes):x; });
                    setNc(Object.assign({},nc,{svcList:newList}));
                  }
                  return (
                    <div key={idx} style={{background:"#f5f8ff",borderRadius:12,border:"1.5px solid #dbe4f0",padding:"12px",marginBottom:10}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                        <div style={{fontSize:12,fontWeight:700,color:"#1e40af",background:"#eff6ff",padding:"3px 10px",borderRadius:999}}>Service {idx+1}</div>
                        <button onClick={function(){ setNc(Object.assign({},nc,{svcList:(nc.svcList||[]).filter(function(_,i){ return i!==idx; })})); }} style={{background:"#fee2e2",color:"#ef4444",border:"none",borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Remove</button>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                        <div><label style={lbl}>Service *</label>
                          <select value={item.svc} onChange={function(e){ updNcItem({svc:e.target.value,status:"Pending"}); }} style={inp}>
                            {svcTypes.map(function(s){ return <option key={s}>{s}</option>; })}
                          </select>
                        </div>
                        <div><label style={lbl}>App No.</label><input value={item.appNo||""} onChange={function(e){ updNcItem({appNo:e.target.value}); }} placeholder="Optional" style={inp} /></div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                        <div><label style={lbl}>Total Fees</label><input type="number" value={item.fees||""} onChange={function(e){ updNcItem({fees:e.target.value}); }} placeholder="0" style={inp} /></div>
                        <div><label style={lbl}>Received Now</label><input type="number" value={item.recv||""} onChange={function(e){ updNcItem({recv:e.target.value}); }} placeholder="0" style={inp} /></div>
                      </div>
                      {item.fees&&(
                        <div>
                          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:6}}>
                            {MODES.map(function(m){ return <button key={m} onClick={function(){ updNcItem({mode:m}); }} style={{padding:"4px 10px",borderRadius:6,border:"1.5px solid",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",background:(item.mode||"Cash")===m?"#1e40af":"#fff",color:(item.mode||"Cash")===m?"#fff":"#6b7280",borderColor:(item.mode||"Cash")===m?"#1e40af":"#dbe4f0"}}>{m}</button>; })}
                          </div>
                          {item.recv&&<div style={{background:"#fff",borderRadius:7,padding:"6px 10px",border:"1px solid #dbe4f0",display:"flex",justifyContent:"space-between"}}>
                            <span style={{fontSize:11,color:"#6b7280"}}>Balance:</span>
                            <span style={{fontSize:12,fontWeight:700,color:Number(item.fees)-Number(item.recv)>0?"#ef4444":"#16a34a"}}>{fmt(Math.max(0,Number(item.fees)-Number(item.recv)))}{Number(item.fees)-Number(item.recv)<=0?" (Cleared)":""}</span>
                          </div>}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add service button */}
                <button onClick={function(){ setNc(Object.assign({},nc,{svcList:(nc.svcList||[]).concat([{svc:SVCLIST[0],appNo:"",status:"Pending",fees:"",recv:"",mode:"Cash"}])})); }} style={{width:"100%",padding:"9px",background:"#f0f7ff",color:"#2563eb",border:"1.5px dashed #bfdbfe",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginBottom:14}}>
                  + Add Service
                </button>

                {/* Summary */}
                {(nc.svcList||[]).length>0&&(
                  <div style={{background:"#f0fdf4",borderRadius:10,padding:"9px 14px",marginBottom:12,border:"1.5px solid #bbf7d0"}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#16a34a",marginBottom:4}}>{(nc.svcList||[]).length} service(s) will be added</div>
                    {(nc.svcList||[]).map(function(item,i){ return <div key={i} style={{fontSize:11,color:"#374151"}}>{i+1}. {item.svc}{item.fees?" - "+fmt(Number(item.fees)):""}{item.recv?" (Rcvd: "+fmt(Number(item.recv))+")":""}</div>; })}
                  </div>
                )}

                <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                  <button onClick={function(){ setModal(null); }} style={btnG}>Cancel</button>
                  <button onClick={addCust} style={btnP}>Add Customer</button>
                </div>
              </div>
            )}
            {modal==="svc"&&(
              <div>
                <div style={{fontSize:16,fontWeight:700,color:"#1a2942",marginBottom:4}}>New Application</div>
                <div style={{fontSize:12,color:"#8fa0b8",marginBottom:16}}>Add one or more services for the customer in one go</div>

                {/* Customer + Date */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                  <div>
                    <label style={lbl}>Customer *</label>
                    <CPick custs={custs} onSelect={function(c){ setNs(Object.assign({},ns,{cid:c.id,cname:c.name})); }} />
                    {ns.cid&&<div style={{marginTop:5,fontSize:12,color:"#2563eb",fontWeight:600}}>Selected: {ns.cname}</div>}
                  </div>
                  <div><label style={lbl}>Date</label><input type="date" value={ns.date} onChange={function(e){ setNs(Object.assign({},ns,{date:e.target.value})); }} style={inp} /></div>
                </div>

                {/* Service list */}
                {ns.svcList.map(function(item,idx){
                  function updItem(changes){
                    var newList=ns.svcList.map(function(x,i){ return i===idx?Object.assign({},x,changes):x; });
                    setNs(Object.assign({},ns,{svcList:newList}));
                  }
                  return (
                    <div key={idx} style={{background:"#f5f8ff",borderRadius:12,border:"1.5px solid #dbe4f0",padding:"14px",marginBottom:10}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                        <div style={{fontSize:12,fontWeight:700,color:"#1e40af",background:"#eff6ff",padding:"3px 10px",borderRadius:999}}>Service {idx+1}</div>
                        {ns.svcList.length>1&&(
                          <button onClick={function(){ setNs(Object.assign({},ns,{svcList:ns.svcList.filter(function(_,i){ return i!==idx; })})); }} style={{background:"#fee2e2",color:"#ef4444",border:"none",borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Remove</button>
                        )}
                      </div>

                      {/* Service + App No + Status */}
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                        <div><label style={lbl}>Service *</label>
                          <select value={item.svc} onChange={function(e){ updItem({svc:e.target.value,status:"Pending"}); }} style={inp}>
                            {svcTypes.map(function(s){ return <option key={s}>{s}</option>; })}
                          </select>
                        </div>
                        <div><label style={lbl}>App No.</label><input value={item.appNo} onChange={function(e){ updItem({appNo:e.target.value}); }} placeholder="Optional" style={inp} /></div>
                      </div>
                      <div style={{marginBottom:8}}><label style={lbl}>Status</label>
                        <select value={item.status} onChange={function(e){ updItem({status:e.target.value}); }} style={inp}>
                          {getStages(item.svc,custom).map(function(k){ return <option key={k}>{k}</option>; })}
                        </select>
                      </div>

                      {/* Payment */}
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                        <div><label style={lbl}>Total Fees</label><input type="number" value={item.fees} onChange={function(e){ updItem({fees:e.target.value}); }} placeholder="0" style={inp} /></div>
                        <div><label style={lbl}>Received Now</label><input type="number" value={item.recv} onChange={function(e){ updItem({recv:e.target.value}); }} placeholder="0" style={inp} /></div>
                      </div>
                      {item.fees&&(
                        <div>
                          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:6}}>
                            {MODES.map(function(m){ return <button key={m} onClick={function(){ updItem({mode:m}); }} style={{padding:"4px 10px",borderRadius:6,border:"1.5px solid",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",background:item.mode===m?"#1e40af":"#fff",color:item.mode===m?"#fff":"#6b7280",borderColor:item.mode===m?"#1e40af":"#dbe4f0"}}>{m}</button>; })}
                          </div>
                          {item.fees&&item.recv&&(
                            <div style={{background:"#fff",borderRadius:7,padding:"6px 10px",border:"1px solid #dbe4f0",display:"flex",justifyContent:"space-between"}}>
                              <span style={{fontSize:11,color:"#6b7280"}}>Balance:</span>
                              <span style={{fontSize:12,fontWeight:700,color:Number(item.fees)-Number(item.recv)>0?"#ef4444":"#16a34a"}}>{fmt(Math.max(0,Number(item.fees)-Number(item.recv)))}{Number(item.fees)-Number(item.recv)<=0?" (Cleared)":""}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add another service button */}
                <button onClick={function(){ setNs(Object.assign({},ns,{svcList:ns.svcList.concat([{svc:SVCLIST[0],appNo:"",status:"Pending",fees:"",recv:"",mode:"Cash"}])})); }} style={{width:"100%",padding:"9px",background:"#f0f7ff",color:"#2563eb",border:"1.5px dashed #bfdbfe",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginBottom:16}}>
                  + Add Another Service
                </button>

                {/* Summary */}
                {ns.svcList.length>1&&(
                  <div style={{background:"#f0fdf4",borderRadius:10,padding:"10px 14px",marginBottom:14,border:"1.5px solid #bbf7d0"}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#16a34a",marginBottom:6}}>{ns.svcList.length} services will be added</div>
                    {ns.svcList.map(function(item,i){ return <div key={i} style={{fontSize:11,color:"#374151",marginBottom:2}}>{i+1}. {item.svc}{item.fees?" - "+fmt(Number(item.fees)):""}{item.recv?" (Received: "+fmt(Number(item.recv))+")":""}</div>; })}
                  </div>
                )}

                <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                  <button onClick={function(){ setModal(null); }} style={btnG}>Cancel</button>
                  <button onClick={addSvc} style={btnP}>Add {ns.svcList.length>1?ns.svcList.length+" Applications":"Application"}</button>
                </div>
              </div>
            )}
            {modal==="pay"&&(
              <div>
                <div style={{fontSize:16,fontWeight:700,color:"#1a2942",marginBottom:18}}>Record Payment</div>
                <div style={{marginBottom:11}}><label style={lbl}>Customer</label><CPick custs={custs} onSelect={function(c){ setNp(Object.assign({},np,{cid:c.id,cname:c.name,sid:"",fees:"",recv:""})); }} />{np.cid&&<div style={{marginTop:6,fontSize:12,color:"#2563eb",fontWeight:600}}>Selected: {np.cname}</div>}</div>
                {np.cid&&(
                  <div style={{marginBottom:11}}>
                    <label style={lbl}>Application</label>
                    <select value={np.sid} onChange={function(e){
                      var ep=pays.find(function(p){ return p.sid===e.target.value; });
                      setNp(Object.assign({},np,{sid:e.target.value,fees:ep?String(ep.total):"",recv:""}));
                    }} style={inp}>
                      <option value="">Select...</option>
                      {svcs.filter(function(s){ return s.cid===np.cid; }).map(function(s){
                        var ep=pays.find(function(p){ return p.sid===s.id; });
                        return <option key={s.id} value={s.id}>{s.svc}{ep?" (Due: "+fmt(ep.pend)+")":""}</option>;
                      })}
                    </select>
                  </div>
                )}

                {/* Show existing payment history if application already has a record */}
                {np.sid&&(function(){
                  var ep=pays.find(function(p){ return p.sid===np.sid; });
                  var pi=ep?insts.filter(function(i){ return i.pid===ep.id; }):[];
                  if(!ep) return null;
                  return (
                    <div style={{background:"#f5f8ff",borderRadius:12,padding:"12px 14px",marginBottom:14,border:"1.5px solid #dbe4f0"}}>
                      <div style={{fontSize:11,fontWeight:700,color:"#1e40af",textTransform:"uppercase",letterSpacing:".06em",marginBottom:10}}>Existing Payment Record</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10,textAlign:"center"}}>
                        <div style={{background:"#fff",borderRadius:8,padding:"8px"}}><div style={{fontSize:10,color:"#8fa0b8",marginBottom:2}}>Total Fees</div><div style={{fontSize:14,fontWeight:700,color:"#1a2942"}}>{fmt(ep.total)}</div></div>
                        <div style={{background:"#fff",borderRadius:8,padding:"8px"}}><div style={{fontSize:10,color:"#8fa0b8",marginBottom:2}}>Paid</div><div style={{fontSize:14,fontWeight:700,color:"#16a34a"}}>{fmt(ep.recv)}</div></div>
                        <div style={{background:"#fff",borderRadius:8,padding:"8px"}}><div style={{fontSize:10,color:"#8fa0b8",marginBottom:2}}>Balance</div><div style={{fontSize:14,fontWeight:700,color:ep.pend>0?"#ef4444":"#16a34a"}}>{ep.pend>0?fmt(ep.pend):"Cleared"}</div></div>
                      </div>
                      {pi.length>0&&(
                        <div>
                          <div style={{fontSize:10,fontWeight:700,color:"#8fa0b8",textTransform:"uppercase",marginBottom:6}}>Payment History</div>
                          {pi.map(function(inst,idx){
                            return (
                              <div key={inst.id} style={{display:"flex",alignItems:"center",gap:8,background:"#fff",borderRadius:7,padding:"6px 10px",marginBottom:4,border:"1px solid #eef2f7"}}>
                                <div style={{width:18,height:18,borderRadius:"50%",background:"#e0e7ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#4338ca",flexShrink:0}}>{"#"+(idx+1)}</div>
                                <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:"#16a34a"}}>{fmt(inst.amt)}</div><div style={{fontSize:10,color:"#8fa0b8"}}>{inst.date}{inst.time?" at "+inst.time:""}</div></div>
                                <span style={{fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:999,background:"#ede9fe",color:"#7c3aed"}}>{inst.mode}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {ep.pend>0&&<div style={{marginTop:8,fontSize:12,fontWeight:700,color:"#c2410c",background:"#fff7ed",borderRadius:7,padding:"6px 10px",textAlign:"center"}}>Enter amount below to record next installment (Max: {fmt(ep.pend)})</div>}
                      {ep.pend===0&&<div style={{marginTop:8,fontSize:12,fontWeight:700,color:"#16a34a",background:"#f0fdf4",borderRadius:7,padding:"6px 10px",textAlign:"center"}}>Payment fully cleared - no balance due</div>}
                    </div>
                  );
                })()}

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:11}}>
                  <div><label style={lbl}>Total Fees</label><input type="number" value={np.fees} onChange={function(e){ setNp(Object.assign({},np,{fees:e.target.value})); }} style={inp} /></div>
                  <div><label style={lbl}>Received Now</label><input type="number" value={np.recv} onChange={function(e){ setNp(Object.assign({},np,{recv:e.target.value})); }} placeholder={np.sid&&pays.find(function(p){ return p.sid===np.sid; })?"Max: "+fmt(pays.find(function(p){ return p.sid===np.sid; }).pend):""} style={inp} /></div>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
                  {MODES.map(function(m){ return <button key={m} onClick={function(){ setNp(Object.assign({},np,{mode:m})); }} style={{padding:"4px 10px",borderRadius:7,border:"1.5px solid",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",background:np.mode===m?"#1e40af":"#fff",color:np.mode===m?"#fff":"#6b7280",borderColor:np.mode===m?"#1e40af":"#dbe4f0"}}>{m}</button>; })}
                </div>
                <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                  <button onClick={function(){ setModal(null); }} style={btnG}>Cancel</button>
                  <button onClick={addPay} style={btnP}>Record Payment</button>
                </div>
              </div>
            )}
            {modal==="doc"&&(
              <div>
                <div style={{fontSize:16,fontWeight:700,color:"#1a2942",marginBottom:18}}>Upload Document</div>
                <div style={{marginBottom:11}}><label style={lbl}>Customer *</label><CPick custs={custs} onSelect={function(c){ var cs=svcs.filter(function(s){ return s.cid===c.id; }); setNdoc(Object.assign({},ndoc,{cid:c.id,cname:c.name,sid:cs.length?cs[0].id:"",svc:cs.length?cs[0].svc:""})); }} />{ndoc.cid&&<div style={{marginTop:6,fontSize:12,color:"#2563eb",fontWeight:600}}>{ndoc.cname}</div>}</div>
                {ndoc.cid&&<div style={{marginBottom:11}}><label style={lbl}>Application</label><select value={ndoc.sid} onChange={function(e){ var sv=svcs.find(function(s){ return s.id===e.target.value; }); setNdoc(Object.assign({},ndoc,{sid:e.target.value,svc:sv?sv.svc:""})); }} style={inp}><option value="">Select...</option>{svcs.filter(function(s){ return s.cid===ndoc.cid; }).map(function(s){ return <option key={s.id} value={s.id}>{s.svc}</option>; })}</select></div>}
                <div style={{marginBottom:11}}><label style={lbl}>Document Type</label><select value={ndoc.type} onChange={function(e){ setNdoc(Object.assign({},ndoc,{type:e.target.value})); }} style={inp}>{docTypes.map(function(t){ return <option key={t}>{t}</option>; })}</select></div>
                <div style={{marginBottom:11}}><label style={lbl}>Document Name *</label><input value={ndoc.fileName} onChange={function(e){ setNdoc(Object.assign({},ndoc,{fileName:e.target.value})); }} placeholder="PAN_Card_Ramesh.pdf" style={inp} /></div>
                <div style={{marginBottom:11}}><label style={lbl}>File or Google Drive Link</label><input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={function(e){ var f=e.target.files[0]; if(!f) return; setNdoc(Object.assign({},ndoc,{fileName:ndoc.fileName||f.name,driveLink:URL.createObjectURL(f)})); }} style={{width:"100%",padding:"8px",borderRadius:8,border:"1.5px solid #dbe4f0",fontSize:12,fontFamily:"inherit",background:"#fff",cursor:"pointer",boxSizing:"border-box"}} /></div>
                <div style={{marginBottom:11}}><label style={lbl}>OR Google Drive Link</label><input value={ndoc.driveLink} onChange={function(e){ setNdoc(Object.assign({},ndoc,{driveLink:e.target.value})); }} placeholder="https://drive.google.com/..." style={inp} /></div>
                <div style={{marginBottom:16}}><label style={lbl}>Note</label><input value={ndoc.note} onChange={function(e){ setNdoc(Object.assign({},ndoc,{note:e.target.value})); }} placeholder="e.g. Original PAN received" style={inp} /></div>
                <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                  <button onClick={function(){ setModal(null); }} style={btnG}>Cancel</button>
                  <button onClick={function(){ if(!ndoc.cid||!ndoc.fileName){ alert("Customer and name required"); return; } setDocs(function(p){ return p.concat([Object.assign({id:"D"+String(docs.length+1).padStart(3,"0"),uploadedOn:TODAY},ndoc)]); }); setNdoc({cid:"",cname:"",sid:"",svc:"",type:"Government Receipt",fileName:"",driveLink:"",note:""}); setModal(null); }} style={btnP}>Save Document</button>
                </div>
              </div>
            )}
            {modal==="followup"&&(
              <div>
                <div style={{fontSize:16,fontWeight:700,color:"#1a2942",marginBottom:18}}>Add Follow-up</div>
                <div style={{marginBottom:11}}><label style={lbl}>Customer *</label><CPick custs={custs} onSelect={function(c){ var cs=svcs.filter(function(s){ return s.cid===c.id; }); setNf(Object.assign({},nf,{cid:c.id,cname:c.name,sid:cs.length?cs[0].id:"",svc:cs.length?cs[0].svc:""})); }} />{nf.cid&&<div style={{marginTop:6,fontSize:12,color:"#2563eb",fontWeight:600}}>{nf.cname}</div>}</div>
                {nf.cid&&<div style={{marginBottom:11}}><label style={lbl}>Application</label><select value={nf.sid} onChange={function(e){ var sv=svcs.find(function(s){ return s.id===e.target.value; }); setNf(Object.assign({},nf,{sid:e.target.value,svc:sv?sv.svc:""})); }} style={inp}><option value="">Select...</option>{svcs.filter(function(s){ return s.cid===nf.cid; }).map(function(s){ return <option key={s.id} value={s.id}>{s.svc} - {s.status}</option>; })}</select></div>}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:11}}>
                  <div><label style={lbl}>Due Date *</label><input type="date" value={nf.due} onChange={function(e){ setNf(Object.assign({},nf,{due:e.target.value})); }} style={inp} /></div>
                  <div><label style={lbl}>Priority</label><select value={nf.priority} onChange={function(e){ setNf(Object.assign({},nf,{priority:e.target.value})); }} style={inp}><option>Normal</option><option>High</option><option>Low</option></select></div>
                </div>
                <div style={{marginBottom:16}}><label style={lbl}>Reminder Note *</label><input value={nf.note} onChange={function(e){ setNf(Object.assign({},nf,{note:e.target.value})); }} placeholder="e.g. Collect DOB documents, Collect balance payment..." style={inp} /></div>
                <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                  <button onClick={function(){ setModal(null); }} style={btnG}>Cancel</button>
                  <button onClick={function(){
                    if(!nf.cid||!nf.note||!nf.due){ alert("Customer, note and date required"); return; }
                    setFollowups(function(p){ return p.concat([Object.assign({id:"F"+String(followups.length+1).padStart(3,"0"),status:"Pending"},nf)]); });
                    setNf({cid:"",cname:"",sid:"",svc:"",due:TODAY,note:"",priority:"Normal"});
                    setModal(null);
                  }} style={btnP}>Add Follow-up</button>
                </div>
              </div>
            )}
            {modal==="staff"&&(
              <div>
                <div style={{fontSize:16,fontWeight:700,color:"#1a2942",marginBottom:18}}>Add Staff</div>
                <div style={{marginBottom:11}}><label style={lbl}>Full Name *</label><input value={nstaff.name} onChange={function(e){ setNstaff(Object.assign({},nstaff,{name:e.target.value})); }} placeholder="Ramesh Kulkarni" style={inp} /></div>
                <div style={{marginBottom:11}}><label style={lbl}>Mobile</label><input value={nstaff.mobile} onChange={function(e){ setNstaff(Object.assign({},nstaff,{mobile:e.target.value.replace(/[^0-9]/g,"").slice(0,10)})); }} placeholder="9876543210" style={inp} /></div>
                <div style={{marginBottom:11}}><label style={lbl}>Role</label><select value={nstaff.role} onChange={function(e){ setNstaff(Object.assign({},nstaff,{role:e.target.value})); }} style={inp}>{["Admin","Operator","Receptionist"].map(function(r){ return <option key={r}>{r}</option>; })}</select></div>
                <div style={{marginBottom:16}}><label style={lbl}>Username *</label><input value={nstaff.username} onChange={function(e){ setNstaff(Object.assign({},nstaff,{username:e.target.value})); }} placeholder="ramesh" style={inp} /></div>
                <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                  <button onClick={function(){ setModal(null); }} style={btnG}>Cancel</button>
                  <button onClick={function(){ if(!nstaff.name||!nstaff.username){ alert("Name and username required"); return; } setStaff(function(p){ return p.concat([Object.assign({id:"E"+String(staff.length+1).padStart(3,"0"),active:true},nstaff)]); }); setNstaff({name:"",mobile:"",role:"Operator",username:""}); setModal(null); }} style={btnP}>Add Staff</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {instM&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,30,80,.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <div style={{background:"#fff",borderRadius:18,padding:"24px 28px",width:400,boxShadow:"0 24px 80px rgba(0,30,80,.2)"}}>
            <div style={{fontSize:16,fontWeight:700,color:"#1a2942",marginBottom:14}}>Add Payment</div>
            {pays.filter(function(p){ return p.id===instM; }).map(function(pay){
              return (
                <div key={pay.id} style={{background:"#f5f8ff",borderRadius:10,padding:"10px 12px",marginBottom:12,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,textAlign:"center"}}>
                  <div><div style={{fontSize:10,color:"#8fa0b8"}}>Total</div><div style={{fontSize:13,fontWeight:700}}>{fmt(pay.total)}</div></div>
                  <div><div style={{fontSize:10,color:"#8fa0b8"}}>Paid</div><div style={{fontSize:13,fontWeight:700,color:"#16a34a"}}>{fmt(pay.recv)}</div></div>
                  <div><div style={{fontSize:10,color:"#8fa0b8"}}>Due</div><div style={{fontSize:13,fontWeight:700,color:"#ef4444"}}>{fmt(pay.pend)}</div></div>
                </div>
              );
            })}
            <div style={{marginBottom:10}}><label style={lbl}>Amount</label><input type="number" value={ni.amt} onChange={function(e){ setNi(Object.assign({},ni,{amt:e.target.value})); }} style={{...inp,fontSize:16,fontWeight:700}} /></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div><label style={lbl}>Mode</label><select value={ni.mode} onChange={function(e){ setNi(Object.assign({},ni,{mode:e.target.value})); }} style={inp}>{MODES.map(function(m){ return <option key={m}>{m}</option>; })}</select></div>
              <div><label style={lbl}>Date</label><input type="date" value={ni.date} onChange={function(e){ setNi(Object.assign({},ni,{date:e.target.value})); }} style={inp} /></div>
            </div>
            <div style={{marginBottom:14}}><label style={lbl}>Note</label><input value={ni.note} onChange={function(e){ setNi(Object.assign({},ni,{note:e.target.value})); }} placeholder="2nd installment" style={inp} /></div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button onClick={function(){ setInstM(null); }} style={btnG}>Cancel</button>
              <button onClick={addInst} style={btnP}>Record</button>
            </div>
          </div>
        </div>
      )}

      {receipt&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,30,80,.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000}}>
          <div style={{background:"#fff",borderRadius:18,width:380,boxShadow:"0 24px 80px rgba(0,30,80,.25)",overflow:"hidden"}}>
            <div style={{background:"linear-gradient(135deg,#1e40af,#2563eb)",padding:"16px 22px",color:"#fff"}}>
              <div style={{fontSize:16,fontWeight:800,letterSpacing:"-0.01em"}}>Ashirwad Multiservices</div>
              <div style={{fontSize:10,opacity:.6,marginTop:2}}>Gandhi Chaman Old Jalna</div>
              <div style={{marginTop:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontSize:12,fontWeight:700,background:"rgba(255,255,255,.15)",padding:"3px 10px",borderRadius:999}}>RCT-{receipt.id}</div>
                <div style={{fontSize:11,opacity:.7}}>{receipt.date}</div>
              </div>
            </div>
            <div style={{padding:"16px 22px"}}>
              {[
                ["Customer Name", receipt.cname],
                ["Customer ID",   receipt.cid],
                ["Service",       receipt.svc],
                ["App / Payment", receipt.sid||"-"],
                ["Payment Mode",  receipt.mode],
                ["Total Fees",    fmt(receipt.total)],
                ["Amount Paid",   fmt(receipt.recv)],
                ["Balance Due",   receipt.pend>0?fmt(receipt.pend):"Cleared"]
              ].map(function(row){
                var isBalance = row[0]==="Balance Due";
                var isPaid = row[0]==="Amount Paid";
                return (
                  <div key={row[0]} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid #f0f4fa"}}>
                    <span style={{fontSize:12,color:"#8fa0b8",fontWeight:600}}>{row[0]}</span>
                    <span style={{fontSize:12.5,color:isBalance&&receipt.pend>0?"#ef4444":isPaid?"#16a34a":"#1a2942",fontWeight:700}}>{row[1]}</span>
                  </div>
                );
              })}
              {receipt.pend>0&&(
                <div style={{marginTop:10,background:"#fff7ed",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#c2410c",fontWeight:600,textAlign:"center"}}>
                  Balance of {fmt(receipt.pend)} is pending
                </div>
              )}
              {receipt.pend===0&&(
                <div style={{marginTop:10,background:"#f0fdf4",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#16a34a",fontWeight:700,textAlign:"center"}}>
                  Payment Fully Cleared
                </div>
              )}
              <div style={{display:"flex",gap:8,marginTop:14}}>
                <a href={"https://wa.me/91"+custs.reduce(function(m,c){ return c.id===receipt.cid?c.mobile:m; },"")+"?text=Dear+"+receipt.cname+",+Receipt+No:+RCT-"+receipt.id+"+for+"+receipt.svc+".+Paid:+"+fmt(receipt.recv)+".+Balance:+"+(receipt.pend>0?fmt(receipt.pend):"Cleared")+"+-+Ashirwad+Multiservices+Jalna"} target="_blank" rel="noreferrer" style={{...btnO,flex:1,fontSize:12,textDecoration:"none",textAlign:"center",padding:"8px"}}>WhatsApp</a>
                <button onClick={function(){
                  var cust = custs.find(function(c){ return c.id===receipt.cid; })||{};
                  var html = "<!DOCTYPE html><html><head><title>Receipt RCT-"+receipt.id+"</title>"
                    +"<style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Segoe UI,sans-serif;padding:24px;background:#f0f4fa;display:flex;justify-content:center;}"
                    +".card{background:#fff;border-radius:14px;width:340px;overflow:hidden;box-shadow:0 4px 20px rgba(0,30,80,.12);}"
                    +".hdr{background:linear-gradient(135deg,#1e40af,#2563eb);color:#fff;padding:16px 18px;}"
                    +".hdr h2{font-size:15px;font-weight:800;margin-bottom:2px;}"
                    +".hdr p{font-size:9px;opacity:.6;}"
                    +".hdr .meta{display:flex;justify-content:space-between;margin-top:10px;}"
                    +".badge{font-size:11px;font-weight:700;background:rgba(255,255,255,.2);padding:3px 10px;border-radius:999px;}"
                    +".body{padding:14px 18px;}"
                    +".row{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid #f5f8ff;}"
                    +".lbl{font-size:11px;color:#8fa0b8;font-weight:600;}"
                    +".val{font-size:12px;font-weight:700;color:#1a2942;}"
                    +".green{color:#16a34a;} .red{color:#ef4444;}"
                    +".alert{margin:10px 0;padding:8px 12px;border-radius:8px;font-size:11px;font-weight:700;text-align:center;}"
                    +".footer{text-align:center;font-size:9px;color:#8fa0b8;padding:10px 18px;border-top:1px solid #f0f4fa;}"
                    +"@media print{body{background:#fff;padding:0;}@page{size:A6;margin:8mm;}.card{box-shadow:none;border-radius:0;width:100%;}}</style>"
                    +"</head><body><div class='card'>"
                    +"<div class='hdr'><h2>Ashirwad Multiservices</h2><p>Gandhi Chaman Old Jalna | 7057075143</p>"
                    +"<div class='meta'><span class='badge'>RCT-"+receipt.id+"</span><span style='font-size:10px;opacity:.7'>"+receipt.date+"</span></div></div>"
                    +"<div class='body'>"
                    +"<div class='row'><span class='lbl'>Customer Name</span><span class='val'>"+receipt.cname+"</span></div>"
                    +"<div class='row'><span class='lbl'>Customer ID</span><span class='val' style='color:#2563eb'>"+receipt.cid+"</span></div>"
                    +"<div class='row'><span class='lbl'>Mobile</span><span class='val'>"+(cust.mobile||"-")+"</span></div>"
                    +"<div class='row'><span class='lbl'>Service</span><span class='val'>"+receipt.svc+"</span></div>"
                    +"<div class='row'><span class='lbl'>Payment Mode</span><span class='val'>"+receipt.mode+"</span></div>"
                    +"<div class='row'><span class='lbl'>Total Fees</span><span class='val'>"+fmt(receipt.total)+"</span></div>"
                    +"<div class='row'><span class='lbl'>Amount Paid</span><span class='val green'>"+fmt(receipt.recv)+"</span></div>"
                    +"<div class='row'><span class='lbl'>Balance Due</span><span class='val "+(receipt.pend>0?"red":"green")+"'>"+(receipt.pend>0?fmt(receipt.pend):"Cleared")+"</span></div>"
                    +(receipt.pend>0?"<div class='alert' style='background:#fff7ed;color:#c2410c;'>Balance of "+fmt(receipt.pend)+" is pending</div>":"<div class='alert' style='background:#f0fdf4;color:#16a34a;'>Payment Fully Cleared</div>")
                    +"</div>"
                    +"<div class='footer'>Thank you for choosing Ashirwad Multiservices - Jalna</div>"
                    +"</div><script>window.onload=function(){ window.print(); };<\/script></body></html>";
                  var blob = new Blob([html], {type:"text/html"});
                  var url = URL.createObjectURL(blob);
                  var a = document.createElement("a");
                  a.href = url;
                  a.target = "_blank";
                  a.click();
                  setTimeout(function(){ URL.revokeObjectURL(url); }, 5000);
                }} style={{...btnG,flex:1,fontSize:12,padding:"8px"}}>Print</button>
                <button onClick={function(){ setReceipt(null); }} style={{...btnG,fontSize:12,padding:"8px 14px"}}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {notify&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,30,80,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000}}>
          <div style={{background:"#fff",borderRadius:18,width:460,boxShadow:"0 24px 80px rgba(0,30,80,.2)",maxHeight:"92vh",overflowY:"auto"}}>
            <div style={{background:"linear-gradient(135deg,#1e40af,#2563eb)",padding:"16px 22px",borderRadius:"18px 18px 0 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div><div style={{fontSize:15,fontWeight:700,color:"#fff"}}>Status Updated</div><div style={{fontSize:11,color:"rgba(255,255,255,.6)"}}>Saved automatically</div></div>
              <button onClick={function(){ setNotify(null); }} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:8,color:"#fff",fontSize:18,cursor:"pointer",padding:"4px 10px",fontWeight:700}}>x</button>
            </div>
            <div style={{padding:"18px 22px"}}>
              <div style={{background:"#f0f7ff",borderRadius:10,padding:"12px 16px",marginBottom:14,border:"1.5px solid #bfdbfe"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,textAlign:"center"}}>
                  <div><div style={{fontSize:10,color:"#8fa0b8",fontWeight:600,textTransform:"uppercase",marginBottom:3}}>Customer</div><div style={{fontSize:13,fontWeight:700,color:"#1a2942"}}>{notify.cust.name}</div></div>
                  <div><div style={{fontSize:10,color:"#8fa0b8",fontWeight:600,textTransform:"uppercase",marginBottom:3}}>Service</div><div style={{fontSize:12,fontWeight:600,color:"#374151"}}>{notify.svc.svc}</div></div>
                  <div><div style={{fontSize:10,color:"#8fa0b8",fontWeight:600,textTransform:"uppercase",marginBottom:3}}>New Status</div><Badge status={notify.svc.status} svc={notify.svc.svc} custom={custom} /></div>
                </div>
              </div>
              <div style={{background:"#fffbeb",borderRadius:10,padding:"14px",marginBottom:14,border:"2px solid #fde68a"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <div style={{width:28,height:28,borderRadius:8,background:"#f59e0b",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>D</div>
                  <div style={{fontSize:13,fontWeight:700,color:"#92400e"}}>Upload Document (optional)</div>
                </div>

                {/* Document Type */}
                <div style={{marginBottom:8}}>
                  <label style={{...lbl,color:"#92400e"}}>Document Type *</label>
                  <select value={notify.docType||"Acknowledgement"} onChange={function(e){ setNotify(Object.assign({},notify,{docType:e.target.value})); }} style={{...inp,border:"1.5px solid #fde68a",background:"#fff"}}>
                    {(svcDocTypes[notify.svc.svc]||DEF_SVC_DOCS[notify.svc.svc]||docTypes).map(function(t){ return <option key={t}>{t}</option>; })}
                  </select>
                </div>

                {/* Document Name */}
                <div style={{marginBottom:8}}>
                  <label style={{...lbl,color:"#92400e"}}>Document Name</label>
                  <input value={notify.docName||""} onChange={function(e){ setNotify(Object.assign({},notify,{docName:e.target.value})); }} placeholder={"e.g. E-PAN_"+notify.cust.name+".pdf"} style={{...inp,border:"1.5px solid #fde68a",background:"#fff"}} />
                </div>

                {/* File Upload */}
                <div style={{marginBottom:8}}>
                  <label style={{...lbl,color:"#92400e"}}>Choose File from PC / Phone</label>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={function(e){
                    var f=e.target.files[0]; if(!f) return;
                    var docType = notify.docType||"Acknowledgement";
                    var docName = notify.docName||f.name;
                    setDocs(function(p){ return p.concat([{
                      id:"D"+String(docs.length+1).padStart(3,"0"),
                      cid:notify.cust.id, cname:notify.cust.name,
                      sid:notify.svc.id,  svc:notify.svc.svc,
                      type:docType, fileName:docName||f.name,
                      driveLink:URL.createObjectURL(f),
                      note:"Status: "+notify.svc.status,
                      uploadedOn:TODAY
                    }]); });
                    setNotify(Object.assign({},notify,{docUploaded:docName||f.name}));
                  }} style={{width:"100%",padding:"9px",borderRadius:8,border:"2px dashed #f59e0b",fontSize:12,fontFamily:"inherit",background:"#fff",cursor:"pointer",boxSizing:"border-box"}} />
                </div>

                {/* OR Drive Link */}
                <div style={{marginBottom:4}}>
                  <label style={{...lbl,color:"#92400e"}}>OR Google Drive / Share Link</label>
                  <input placeholder="https://drive.google.com/..." style={{...inp,border:"1.5px solid #fde68a",background:"#fff",fontSize:12}} onChange={function(e){
                    if(!e.target.value) return;
                    var docType = notify.docType||"Acknowledgement";
                    var docName = notify.docName||(notify.svc.svc+" - "+notify.svc.status);
                    setDocs(function(p){ return p.concat([{
                      id:"D"+String(docs.length+1).padStart(3,"0"),
                      cid:notify.cust.id, cname:notify.cust.name,
                      sid:notify.svc.id,  svc:notify.svc.svc,
                      type:docType, fileName:docName,
                      driveLink:e.target.value,
                      note:"Status: "+notify.svc.status,
                      uploadedOn:TODAY
                    }]); });
                    setNotify(Object.assign({},notify,{docUploaded:docName}));
                  }} />
                </div>

                {/* Uploaded confirmation */}
                {notify.docUploaded&&(
                  <div style={{marginTop:8,background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:7,padding:"7px 10px",fontSize:12,color:"#16a34a",fontWeight:700}}>
                    Saved: {notify.docUploaded}
                  </div>
                )}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
                <a href={"https://wa.me/91"+notify.cust.mobile+"?text=Dear+"+notify.cust.name+",+your+"+notify.svc.svc+"+status:+"+notify.svc.status+"+-Ashirwad+Multiservices+Jalna"} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#f0fdf4",border:"1.5px solid #bbf7d0",borderRadius:10,textDecoration:"none"}}>
                  <div style={{width:28,height:28,borderRadius:8,background:"#16a34a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:"#fff",flexShrink:0}}>WA</div>
                  <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"#16a34a"}}>WhatsApp</div><div style={{fontSize:11,color:"#8fa0b8"}}>+91 {notify.cust.mobile}</div></div>
                  <span style={{fontSize:10,color:"#16a34a",fontWeight:700}}>Tap to open</span>
                </a>
                <div style={{background:"#fff7ed",border:"1.5px solid #fed7aa",borderRadius:10,padding:"12px 14px"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                    <div style={{fontSize:13,fontWeight:700,color:"#c2410c"}}>SMS - +91 {notify.cust.mobile}</div>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={function(){ navigator.clipboard && navigator.clipboard.writeText("Dear "+notify.cust.name+", your "+notify.svc.svc+" status: "+notify.svc.status+". -Ashirwad Jalna").then(function(){ alert("Copied!"); }); }} style={{...btnG,padding:"4px 10px",fontSize:11}}>Copy</button>
                      <button onClick={function(){ window.open("sms:+91"+notify.cust.mobile,"_blank"); }} style={{...btnO,padding:"4px 10px",fontSize:11}}>Open App</button>
                    </div>
                  </div>
                  <div style={{fontSize:12,color:"#374151",background:"#fff",borderRadius:7,padding:"8px 10px",border:"1px solid #fed7aa"}}>{"Dear "+notify.cust.name+", your "+notify.svc.svc+" application status updated to: "+notify.svc.status+". App No: "+(notify.svc.appNo||"-")+". -Ashirwad Multiservices Jalna"}</div>
                </div>
                {notify.cust.email&&(
                  <a href={"mailto:"+notify.cust.email+"?subject=Application Update - "+notify.svc.svc+"&body=Dear "+notify.cust.name+", your "+notify.svc.svc+" status is now: "+notify.svc.status} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#eff6ff",border:"1.5px solid #bfdbfe",borderRadius:10,textDecoration:"none"}}>
                    <div style={{width:28,height:28,borderRadius:8,background:"#2563eb",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:"#fff",flexShrink:0}}>EM</div>
                    <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"#2563eb"}}>Email</div><div style={{fontSize:11,color:"#8fa0b8"}}>{notify.cust.email}</div></div>
                  </a>
                )}
              </div>
              <button onClick={function(){ setNotify(null); }} style={{...btnP,width:"100%",padding:"12px",fontSize:14}}>Done</button>
            </div>
          </div>
        </div>
      )}

      {shareM&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,30,80,.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000}}>
          <div style={{background:"#fff",borderRadius:18,padding:"24px 28px",width:380,boxShadow:"0 24px 80px rgba(0,30,80,.25)",textAlign:"center"}}>
            <div style={{fontSize:16,fontWeight:700,color:"#1a2942",marginBottom:4}}>Customer Added!</div>
            <div style={{fontSize:12,color:"#8fa0b8",marginBottom:14}}>{shareM.name} registered successfully</div>
            <a href={"https://wa.me/91"+shareM.mob+"?text=Dear+"+shareM.name+",+Welcome+to+Ashirwad+Multiservices!+Your+login+mobile:+"+shareM.mob} target="_blank" rel="noreferrer" style={{display:"block",padding:"11px",background:"#f0fdf4",border:"1.5px solid #bbf7d0",borderRadius:10,textDecoration:"none",fontSize:13,fontWeight:700,color:"#16a34a",marginBottom:10}}>Send Welcome via WhatsApp</a>
            <button onClick={function(){ setShareM(null); }} style={{...btnP,width:"100%"}}>Done</button>
          </div>
        </div>
      )}

    </div>
  );
}
