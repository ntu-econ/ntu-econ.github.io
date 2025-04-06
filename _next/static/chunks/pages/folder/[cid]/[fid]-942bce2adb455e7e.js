(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[509],{2868:function(e,s,a){(window.__NEXT_P=window.__NEXT_P||[]).push(["/folder/[cid]/[fid]",function(){return a(1874)}])},5984:function(e,s,a){"use strict";a.d(s,{Z:function(){return i}});var n=a(5893);function l(){return(0,n.jsxs)("div",{children:[(0,n.jsx)("nav",{className:"navbar navbar-expand-lg bg-body-tertiary",children:(0,n.jsxs)("div",{className:"container-fluid",children:[(0,n.jsx)("a",{className:"navbar-brand",href:"/",children:"NTU ECON Database"}),(0,n.jsx)("script",{src:"https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js",integrity:"sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM",crossorigin:"anonymous"}),(0,n.jsx)("button",{className:"navbar-toggler",type:"button","data-bs-toggle":"collapse","data-bs-target":"#navbarSupportedContent","aria-controls":"navbarSupportedContent","aria-expanded":"false","aria-label":"Toggle navigation",children:(0,n.jsx)("span",{className:"navbar-toggler-icon"})}),(0,n.jsxs)("div",{className:"collapse navbar-collapse",id:"navbarSupportedContent",children:[(0,n.jsxs)("ul",{className:"navbar-nav me-auto mb-2 mb-lg-0",children:[(0,n.jsx)("li",{className:"nav-item",children:(0,n.jsx)("a",{className:"nav-link active","aria-current":"page",href:"/curriculum",children:"課程"})}),(0,n.jsx)("li",{className:"nav-item",children:(0,n.jsx)("a",{className:"nav-link",href:"https://ntu-econ.github.io/v2",children:"舊版資料庫"})})]}),(0,n.jsx)("button",{type:"button",className:"btn btn-outline-success ms-auto",onClick:()=>window.location.href="https://docs.google.com/forms/d/e/1FAIpQLSfA35zuNWFAS2YtSn1S59oH5m-vplSjX2I4bsfZxhJjGqasWw/viewform?usp=sf_link",children:"檔案上傳"})]})]})}),(0,n.jsx)("div",{class:"modal fade",id:"notifyModal",tabindex:"-1","aria-labelledby":"exampleModalLabel","aria-hidden":"true",children:(0,n.jsx)("div",{class:"modal-dialog",children:(0,n.jsxs)("div",{class:"modal-content",children:[(0,n.jsxs)("div",{class:"modal-header",children:[(0,n.jsx)("h5",{class:"modal-title",id:"exampleModalLabel",children:"提醒"}),(0,n.jsx)("button",{type:"button",class:"btn-close","data-bs-dismiss":"modal","aria-label":"Close"})]}),(0,n.jsx)("div",{class:"modal-body",children:"為避免上傳頁面遭濫用，請先登入Google帳號。"}),(0,n.jsxs)("div",{class:"modal-footer",children:[(0,n.jsx)("button",{type:"button",class:"btn btn-secondary","data-bs-dismiss":"modal",children:"取消"}),(0,n.jsx)("a",{href:"/upload",type:"button",class:"btn btn-primary",children:"前往上傳頁面"})]})]})})})]})}a(4005);var t=a(4304);function i(e){let{children:s}=e;return(0,n.jsxs)("div",{style:{display:"flex",flexDirection:"column",minHeight:"100vh"},children:[(0,n.jsx)(l,{}),(0,n.jsx)(t.Wi,{gaMeasurementId:"G-9DND5R7733"}),(0,n.jsx)("div",{style:{flex:"1"},children:s}),(0,n.jsxs)("footer",{className:"footer mt-auto py-3 bg-light",children:[(0,n.jsxs)("div",{className:"container",style:{fontSize:"0.9rem"},children:[(0,n.jsx)("h5",{style:{fontSize:"1rem"},children:"台大經濟資料庫"}),(0,n.jsx)("p",{className:"text-muted",children:"本網站由台大經濟系學會學術部架設及維護，所有資料的著作權為各課程授課老師及檔案提供者所有，請勿將資料用於學習以外的用途。"})]}),(0,n.jsxs)("div",{className:"container d-flex justify-content-between",style:{fontSize:"0.9rem"},children:[(0,n.jsxs)("div",{children:[(0,n.jsx)("span",{className:"text-muted",children:"\xa9 2024 台大經濟系學會學術部"}),(0,n.jsx)("br",{}),(0,n.jsx)("span",{className:"text-muted",children:"Ver: 3.2"})]}),(0,n.jsx)("div",{children:(0,n.jsxs)("span",{className:"text-muted",children:["網頁設計：",(0,n.jsx)("a",{href:"https://github.com/MorganLee0906",children:"ChengYu Lee"})]})})]})]})]})}},1874:function(e,s,a){"use strict";a.r(s),a.d(s,{__N_SSG:function(){return i},default:function(){return r}});var n=a(5893);a(9008);var l=a(5984),t=a(1163),i=!0;function r(e){let{folderData:s}=e,a=s.folder.sort((e,s)=>e.name.localeCompare(s.name)),i=s.file.sort((e,s)=>e.name.localeCompare(s.name));console.log("Generating folder page:"+s.route);let{cid:r,fid:c}=(0,t.useRouter)().query;return(0,n.jsx)("div",{children:(0,n.jsxs)(l.Z,{children:[(0,n.jsx)("div",{class:"container",children:(0,n.jsx)("center",{children:(0,n.jsx)("h2",{children:"課程資料"})})}),(0,n.jsx)("div",{class:"container",children:(0,n.jsxs)("h6",{children:["現在位置：",s.route.split("/").map(e=>(0,n.jsx)("span",{class:"badge bg-primary me-2 align-items-center",children:e}))]})}),(0,n.jsxs)("div",{class:"container",children:[(0,n.jsx)("ul",{class:"list-group list-group-flush",children:(0,n.jsx)("div",{className:"list-group",children:a.map(e=>{let s=e.file_count>0,a=s?{href:"/folder/".concat(r,"/").concat(e.url),className:"list-group-item list-group-item-action"}:{className:"list-group-item list-group-item-action disabled text-muted",title:"此資料夾無檔案"};return(0,n.jsxs)("a",{...a,children:[(0,n.jsx)("div",{class:"d-flex w-100 justify-content-begin",children:(0,n.jsx)("h5",{class:"mb-1",children:e.name})}),(0,n.jsx)("div",{class:"d-flex justify-content-end",children:s?(0,n.jsxs)("span",{class:"badge bg-primary me-2 align-items-center",children:["共有",e.file_count,"個檔案"]}):(0,n.jsx)("span",{class:"badge bg-secondary me-2 align-items-center",children:"本資料夾暫無檔案"})})]},e.url)})})}),a.length>0&&i.length>0&&(0,n.jsx)("hr",{}),(0,n.jsx)("div",{className:"list-group",children:i.map(e=>(0,n.jsx)("a",{href:"/file?id=".concat(e.url),className:"list-group-item list-group-item-action",children:e.name}))}),0===a.length&&0===i.length&&(0,n.jsx)("p",{children:"抱歉，這裡沒有任何文件和資料夾:("})]})]})})}}},function(e){e.O(0,[495,888,774,179],function(){return e(e.s=2868)}),_N_E=e.O()}]);