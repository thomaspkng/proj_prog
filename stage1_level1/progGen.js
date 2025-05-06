/* JS for generate project program */
// ST - Dispaly formatting with CSS
function changeTab(tabName) {
  getContainerWidth();
  let i, tabContent, tabLinks;
  tabContent = document.getElementsByClassName('tabContent');
  for(i=0;i<tabContent.length;i++) {
    tabContent[i].style.display = "none";
  }
  tabLinks = document.getElementsByClassName('tablinks');
  for(i=0;i<tabLinks.length;i++) {
    tabLinks[i].className = tabLinks[i].className.replace(" active","");
  }
  document.getElementById(tabName).style.display = "block";
  document.getElementById(`btn_${tabName}`).className += " active";
}
function getContainerWidth() {
    let mainContainerW = document.getElementById('mainContainer').clientWidth;
  }
// ED - Dispaly formatting with CSS

// Data, Chart and Table Maniplate
// Global variables
let focusCell = [1,1];
let svg2jpg = new Image(); // for rendered Gantt Chart
let svg_final = ""; // for finalized SVG
// template JSON for whole program
let progJSON =
{
  "projectdata":{
    "projtitle":"[...project title here]",
    "progtitle":"[...program title here]",
    "prepared":"[...prepared by]",
    "version":"[...version here]",
    "dateofupdate":"[...Date of update here]"
  },
  "taskJSON":[],
  "ganttchartFormat":{
    "tid":0,
    "margin_offset":1,
    "borderW":1,
    "item_col_width":40,
    "desc_col_width":250,
    "start_col_width":50,
    "end_col_width":50,
    "dur_col_width":50,
    "day_col_width":25,
    "end_day_extend":3,
    "title_box_height":80,
    "logo_box_width":150,
    "logo_box_height":80,
    "footing_box_height":30,
    "days_box_height":30,
    "day_box_height":30,
    "task_box_height":30,
    "title_text_height":18,
    "title_text_offset_x":10,
    "title_text_offset_y":5,
    "task_text_height":12,
    "task_text_offset_x":5,
    "task_head_text_offset_y":3,
    "task_text_offset_y":3,
    "font_family":"Tahoma",
    "daybarbgCol":["#DEF","#EDF"],
    "taskbarCol":"#00F"
  },
  "verChkCode":"0000"
};
// formatting of chart, to be update by external JSON
let workingDay_number = 1; // default total days of the project
let title_box_width = 100;
let svg_height = 10;
let tasks_height = 10;
let taskHead_totalWidth = 10;
// operations on picture generation

// Task Table
// use {progJSON} to generate input table
function JSON2inputTable() {
  // generate the task table
  let tr_now, item_now, desc_now, start_now, end_now, dur_now, fs_now, ss_now, ff_now, i;
  let tbody_content = "";
  let tJ = progJSON.taskJSON;
  for(i=0;i<tJ.length;i++) {
    tid_now = tJ[i].tid;
    item_now = tJ[i].item;
    desc_now = tJ[i].desc;
    start_now = tJ[i].start;
    end_now = tJ[i].end;
    dur_now = tJ[i].dur;
    fs_now = tJ[i].fs;
    ss_now = tJ[i].ss;
    ff_now = tJ[i].ff;
    tr_now =`
    <tr>
      <td><input class="table_tid" type="text" value="${tid_now}" disabled /></td>
      <td><input class="table_item" type="text" value="${item_now}" tdn=1 /></td>
      <td><input class="table_desc" type="text" value="${desc_now}" tdn=2 /></td>
      <td><input class="table_start" type="number" step="1" value="${start_now}" tdn=3 /></td>
      <td><input class="table_dur" type="number" step="1" value="${dur_now}" tdn=4 /></td>
      <td><input class="table_end" type="number" value="${end_now}" disabled /></td>
      <td><input class="flowlogic" type="text" value="${fs_now}" disabled /></td>
      <td><input class="flowlogic" type="text" value="${ss_now}" disabled /></td>
      <td><input class="flowlogic" type="text" value="${ff_now}" disabled /></td>
      <td><button class="btn_del">Del</button></td>
    </tr>
    `;
    tbody_content += tr_now;
  }
  document.getElementById('dataEntry').innerHTML = tbody_content;
  addTaskListeners();
  // title block data refill
  document.getElementById('projT').value = progJSON.projectdata.projtitle;
  document.getElementById('progT').value = progJSON.projectdata.progtitle;
  document.getElementById('prep').value = progJSON.projectdata.prepared;
  document.getElementById('dUpdate').value = progJSON.projectdata.dateofupdate;
  document.getElementById('verSion').value = progJSON.projectdata.version;
  document.getElementById('dayExtend').value = progJSON.ganttchartFormat.end_day_extend;

  // ST - showjson at tab, to be delete
  document.getElementById('jsonnow').innerHTML = JSON.stringify(progJSON);
  // ED - showjson at tab, to be delete
}

// on table input change, check and modify {progJSON} and regen chart & table
function inputTable2JSON() {
  let i;
  let taskJSON_now_Array = [];
  let pJ = progJSON.projectdata;
  let fJ = progJSON.ganttchartFormat;
  // modify proj titles and end-day-extend
  pJ.projtitle = document.getElementById('projT').value;
  pJ.progtitle = document.getElementById('progT').value;
  pJ.version = document.getElementById('verSion').value;
  pJ.dateofupdate = document.getElementById('dUpdate').value;
  pJ.prepared = document.getElementById('prep').value;
  fJ.end_day_extend = parseInt(document.getElementById('dayExtend').value);
  // read dataTable line-by-line and modify JSON
  let dataTable = document.getElementById('dataEntry');
  let rows = dataTable.getElementsByTagName('tr');
  for(i=0;i<rows.length;i++) {
    let rn = rows[i].getElementsByTagName('td');
    let taskJSON_now = `{"item":"${rn[1].children[0].value}","desc":"${rn[2].children[0].value}","start":${rn[3].children[0].value},"end":${rn[5].children[0].value},"dur":${rn[4].children[0].value},"fs":"${rn[6].children[0].value}","ss":"${rn[7].children[0].value}","ff":"${rn[8].children[0].value}","tid":${rn[0].children[0].value}}`;
    taskJSON_now_Array.push(JSON.parse(taskJSON_now));
  }
  progJSON.taskJSON = taskJSON_now_Array;
  document.getElementById('jsonnow').innerHTML = JSON.stringify(progJSON);
  // finish data modification, re-generate table and chart
  JSON2inputTable();
  renderSVG2PIC();
}

//add task
function addTask() {
  let tJ = progJSON.taskJSON;
  let taskTemplate = `{"item":"_item","desc":"_description","start":1,"end":1,"dur":1,"fs":"","ss":"","ff":"","tid":${progJSON.ganttchartFormat.tid+1}}`;
  progJSON.ganttchartFormat.tid += 1;
  tJ.push(JSON.parse(taskTemplate));
  progJSON.taskJSON = tJ;
  let lastRowIndex = progJSON.taskJSON.length;
  focusCell = [lastRowIndex,1];
  renderSVG2PIC();
  JSON2inputTable();
}
// delete task
function delTask(evt) {
  focusCell = [1,1];
  let rowID = evt.target.closest('tr').rowIndex;
  document.getElementById('tasksTable').deleteRow(rowID);
  inputTable2JSON();
}

// Event Listeners
// add listeners to non-regenerate elements
function addListeners() {}
// add listeners to elements after regenerate input-table
function addTaskListeners() {
  let i;
  let items = document.getElementsByClassName('table_item');
  for(i=0;i<items.length;i++) {
    items[i].addEventListener('change', (evt) => {
      let rowIndex_now = evt.target.closest('tr').rowIndex;
      focusCell = [rowIndex_now, 1];
      inputTable2JSON();
      focusLastInput();
    });
  }
  let descs = document.getElementsByClassName('table_desc');
  for(i=0;i<descs.length;i++) {
    descs[i].addEventListener('change', (evt) => {
      let rowIndex_now = evt.target.closest('tr').rowIndex;
      focusCell = [rowIndex_now, 2];
      inputTable2JSON();
      focusLastInput();
    });
  }
  let dels = document.getElementsByClassName('btn_del');
  for(i=0;i<dels.length;i++) {
    dels[i].addEventListener('click', function(evt) {delTask(evt);})
  }
  st_dur_check(); // check if value > 0
}
// Title change, regen chart
function titleChange() {
  inputTable2JSON();
}
// day extend after completion change, check if value > 0, trigger hard coded
function dayExtChk() {
  let value_now = document.getElementById('dayExtend').value;
  value_now = (value_now<1)?1:value_now;
  document.getElementById('dayExtend').value = value_now;
  inputTable2JSON();
}
// check the value of input START / DUR > 0 and Calc End Date
function st_dur_check() {
  let i;
  let start_e_now = document.getElementsByClassName('table_start');
  let dur_e_now = document.getElementsByClassName('table_dur');
  for(i=0;i<start_e_now.length;i++) {
    start_e_now[i].addEventListener('change',function(evt) {
      if(this.value<1) {this.value=1}
      let startValue_now = parseInt(this.parentNode.parentNode.getElementsByTagName('td')[3].childNodes[0].value);
      let durValue_now = parseInt(this.parentNode.parentNode.getElementsByTagName('td')[4].childNodes[0].value);
      let endValue_now = startValue_now + durValue_now - 1;
      this.parentNode.parentNode.getElementsByTagName('td')[5].childNodes[0].value = endValue_now;
      let rowIndex_now = evt.target.closest('tr').rowIndex;
      focusCell = [rowIndex_now,3];
      inputTable2JSON();
      focusLastInput();
    });
  }
  for(i=0;i<dur_e_now.length;i++) {
    dur_e_now[i].addEventListener('change',function(evt) {
      if(this.value<1) {this.value=1}
      let startValue_now = parseInt(this.parentNode.parentNode.getElementsByTagName('td')[3].childNodes[0].value);
      let durValue_now = parseInt(this.parentNode.parentNode.getElementsByTagName('td')[4].childNodes[0].value);
      let endValue_now = startValue_now + durValue_now - 1;
      this.parentNode.parentNode.getElementsByTagName('td')[5].childNodes[0].value = endValue_now;
      let rowIndex_now = evt.target.closest('tr').rowIndex;
      focusCell = [rowIndex_now,4];
      inputTable2JSON();
      focusLastInput();
    });
  }
}

function focusLastInput() {
  let rowIndex_now = parseInt(focusCell[0])-1;
  let tdIndex_now = parseInt(focusCell[1]);
  let tbody = document.getElementById('dataEntry');
  let rows = tbody.getElementsByTagName('tr');
  let row_now = rows[rowIndex_now];
    if(rows.length>0) {
    let tds = row_now.getElementsByTagName('td');
    tds[tdIndex_now].children[0].focus();
  }
}

// Task SVG/Pic
// generate svg component for titlebox
function svg_titleboxGen() {
  let fJ = progJSON.ganttchartFormat;
  let margin_border = fJ.margin_offset + fJ.borderW;
  let titleBoxSVG = `
  <g id="titleBox" transform="translate(${margin_border} ${margin_border})">
    <rect x="0" y="0" width="${title_box_width}" height="${fJ.title_box_height}" style="fill:#FFF;stroke:#222; stroke-width:1px;" />
    <text x="${fJ.title_text_offset_x}" y="${fJ.title_text_offset_y+fJ.title_text_height}" font-size="${fJ.title_text_height}" font-family="${fJ.font_family}">${progJSON.projectdata.projtitle}</text>
    <text x="${fJ.title_text_offset_x}" y="${2*(fJ.title_text_offset_y+fJ.title_text_height)}" font-size="${fJ.title_text_height}" font-family="${fJ.font_family}">${progJSON.projectdata.progtitle}</text>
  </g>
  `;
  return titleBoxSVG;
}
// generate svg component for taskhead [ID, desc, start...]
function svg_taskheadGen() {
  let fJ = progJSON.ganttchartFormat;
  let taskheadHeight = fJ.days_box_height + fJ.day_box_height;
  let itemHead = `
  <rect x="0" y="0" width="${fJ.item_col_width}" height="${taskheadHeight}" style="fill:#FFF; stroke:#222; stroke-width:1px;" />
  <text x="${fJ.item_col_width/2}" y="${taskheadHeight-fJ.task_head_text_offset_y}" font-size="${fJ.task_text_height}" font-family="${fJ.font_family}" text-anchor="middle">Item</text>
  `;
  let descHead = `
  <rect x="${fJ.item_col_width}" y="0" width="${fJ.desc_col_width}" height="${taskheadHeight}" style="fill:#FFF; stroke:#222; stroke-width:1px;" />
  <text x="${fJ.task_text_offset_x+fJ.item_col_width}" y="${taskheadHeight-fJ.task_head_text_offset_y}" font-size="${fJ.task_text_height}" font-family="${fJ.font_family}">Description</text>
  `;
  let startHead = `
  <rect x="${fJ.item_col_width+fJ.desc_col_width}" y="0" width="${fJ.start_col_width}" height="${taskheadHeight}" style="fill:#FFF; stroke:#222; stroke-width:1px;" />
  <text x="${fJ.item_col_width+fJ.desc_col_width+fJ.start_col_width/2}" y="${taskheadHeight-fJ.task_head_text_offset_y}" font-size="${fJ.task_text_height}" font-family="${fJ.font_family}" text-anchor="middle">Start</text>
  `;
  let endHead = `
  <rect x="${fJ.item_col_width+fJ.desc_col_width+fJ.start_col_width}" y="0" width="${fJ.end_col_width}" height="${taskheadHeight}" style="fill:#FFF; stroke:#222; stroke-width:1px;" />
  <text x="${fJ.item_col_width+fJ.desc_col_width+fJ.start_col_width+fJ.end_col_width/2}" y="${taskheadHeight-fJ.task_head_text_offset_y}" font-size="${fJ.task_text_height}" font-family="${fJ.font_family}" text-anchor="middle">End</text>
  `;
  let durHead = `
  <rect x="${fJ.item_col_width+fJ.desc_col_width+fJ.start_col_width+fJ.end_col_width}" y="0" width="${fJ.dur_col_width}" height="${taskheadHeight}" style="fill:#FFF; stroke:#222; stroke-width:1px;" />
  <text x="${fJ.item_col_width+fJ.desc_col_width+fJ.start_col_width+fJ.end_col_width+fJ.dur_col_width/2}" y="${taskheadHeight-fJ.task_head_text_offset_y}" font-size="${fJ.task_text_height}" font-family="${fJ.font_family}" text-anchor="middle">Duration</text>
  `;
  let taskHeadSVG = `
  <g id="taskHead" transform="translate(${fJ.margin_offset+fJ.borderW} ${fJ.title_box_height+fJ.margin_offset+fJ.borderW})">
    ${itemHead}
    ${descHead}
    ${startHead}
    ${endHead}
    ${durHead}
  </g>
  `;
  return taskHeadSVG;
}
// generate svg component for days bar and day heads
function svg_daysHeadGen() {
  let fJ = progJSON.ganttchartFormat;
  taskHead_totalWidth = fJ.item_col_width + fJ.desc_col_width + fJ.start_col_width + fJ.end_col_width + fJ.dur_col_width;
  let days_box = `
  <rect x="0" y="0" width="${(workingDay_number+fJ.end_day_extend+1)*fJ.day_col_width}" height="${fJ.days_box_height}" style="fill:#FFF; stroke:#222; stroke-width:1px;" />
  <text x="${(workingDay_number+fJ.end_day_extend+1)*fJ.day_col_width/2}" y="${(fJ.days_box_height+fJ.task_text_height)/2}" font-size="${fJ.task_text_height}" font-family="${fJ.font_family}" text-anchor="middle">Day</text>
  `;
  let day_boxes = "";
  for(let i=0;i<(workingDay_number+fJ.end_day_extend+1);i++) {
    let day_boxes_now = `
    <rect x="${i*fJ.day_col_width}" y="${fJ.days_box_height}" width="${fJ.day_col_width}" height="${fJ.day_box_height}" style="fill:none; stroke:#222; stroke-width:1px;" />
    <text x="0" y="0" font-size="${fJ.task_text_height}" transform="translate(${(i+0.5)*fJ.day_col_width+fJ.task_text_height/2} ${fJ.days_box_height+fJ.day_box_height-5}) rotate(-90)">${i}</text>
    `;
    day_boxes += day_boxes_now;
  }
  let daysHead = `
  <g id="daysHead" transform="translate(${taskHead_totalWidth+fJ.margin_offset+fJ.borderW} ${fJ.title_box_height+fJ.margin_offset+fJ.borderW})">
  ${days_box}
  ${day_boxes}
  </g>
  `;
  return daysHead;
}
// generate svg componemt for vertical day background
function svg_daybarGen() {
  let fJ = progJSON.ganttchartFormat;
  let daybarSVG = "";
  let daybar = "";
  let daybarH = progJSON.taskJSON.length * progJSON.ganttchartFormat.task_box_height;
  for(let i=0;i<workingDay_number+progJSON.ganttchartFormat.end_day_extend+1;i++) {
    let barCol = (i%2==0)?`${progJSON.ganttchartFormat.daybarbgCol[0]}`:`${progJSON.ganttchartFormat.daybarbgCol[1]}`;
    let daybar_now = `
    <rect x="${i*progJSON.ganttchartFormat.day_col_width}" y="0" width="${progJSON.ganttchartFormat.day_col_width}" height="${daybarH}" style="fill:${barCol}; stroke:#222; stroke-width:1px;" />
    `;
    daybar += daybar_now;
  }
  daybarSVG = `
  <g id="daybarSVG" transform="translate(${taskHead_totalWidth+fJ.margin_offset+fJ.borderW} ${progJSON.ganttchartFormat.title_box_height+progJSON.ganttchartFormat.days_box_height+progJSON.ganttchartFormat.day_box_height+fJ.margin_offset+fJ.borderW})">
  ${daybar}
  </g>
  `;
  return daybarSVG;
}
// generate svg component for each task from {progJSON}
function svg_taskGen() {
  let taskSVG = "";
  let tasks = "";
  let fJ = progJSON.ganttchartFormat;
  let tJ = progJSON.taskJSON;
  let taskNum = tJ.length;
  for(let i=0;i<taskNum;i++) {
    let start_now = tJ[i].start;
    let end_now = tJ[i].end;
    let taskSVG_now = `
    <rect x="0" y="${i*fJ.task_box_height}" width="${fJ.item_col_width}" height="${fJ.task_box_height}" style="fill:#FFF; stroke:#222; stroke-width:1px" />
    <text x="${fJ.item_col_width/2}" y="${(i+1)*fJ.task_box_height-fJ.task_text_offset_y}" text-anchor="middle" font-size="${fJ.task_text_height}" font-family="${fJ.font_family}">${tJ[i].item}</text>
    <rect x="${fJ.item_col_width}" y="${i*fJ.task_box_height}" width="${fJ.desc_col_width}" height="${fJ.task_box_height}" style="fill:#FFF; stroke:#222; stroke-width:1px" />
    <text x="${fJ.item_col_width+fJ.task_text_offset_x}" y="${(i+1)*fJ.task_box_height-fJ.task_text_offset_y}" font-size="${fJ.task_text_height}" font-family="${fJ.font_family}">${tJ[i].desc}</text>
    <rect x="${fJ.item_col_width+fJ.desc_col_width}" y="${i*fJ.task_box_height}" width="${fJ.start_col_width}" height="${fJ.task_box_height}" style="fill:#FFF; stroke:#222; stroke-width:1px" />
    <text x="${fJ.item_col_width+fJ.desc_col_width+fJ.start_col_width/2}" y="${(i+1)*fJ.task_box_height-fJ.task_text_offset_y}" text-anchor="middle" font-size="${fJ.task_text_height}" font-family="${fJ.font_family}">${tJ[i].start}</text>
    <rect x="${fJ.item_col_width+fJ.desc_col_width+fJ.start_col_width}" y="${i*fJ.task_box_height}" width="${fJ.end_col_width}" height="${fJ.task_box_height}" style="fill:#FFF; stroke:#222; stroke-width:1px" />
    <text x="${fJ.item_col_width+fJ.desc_col_width+fJ.start_col_width+fJ.end_col_width/2}" y="${(i+1)*fJ.task_box_height-fJ.task_text_offset_y}" text-anchor="middle" font-size="${fJ.task_text_height}" font-family="${fJ.font_family}">${tJ[i].end}</text>
    <rect x="${fJ.item_col_width+fJ.desc_col_width+fJ.start_col_width+fJ.end_col_width}" y="${i*fJ.task_box_height}" width="${fJ.dur_col_width}" height="${fJ.task_box_height}" style="fill:#FFF; stroke:#222; stroke-width:1px" />
    <text x="${fJ.item_col_width+fJ.desc_col_width+fJ.start_col_width+fJ.end_col_width+fJ.dur_col_width/2}" y="${(i+1)*fJ.task_box_height-fJ.task_text_offset_y}" text-anchor="middle" font-size="${fJ.task_text_height}" font-family="${fJ.font_family}">${tJ[i].dur}</text>
    <line x1="${taskHead_totalWidth+start_now*fJ.day_col_width}" y1="${(i+0.5)*fJ.task_box_height}" x2="${taskHead_totalWidth+(end_now+1)*fJ.day_col_width}" y2="${(i+0.5)*fJ.task_box_height}" style="stroke:${fJ.taskbarCol}; stroke-width:${fJ.task_box_height/2}" />
    `;
    tasks += taskSVG_now;
  }
  taskSVG = `
  <g id="taskSVG" transform="translate(${fJ.margin_offset+fJ.borderW} ${fJ.title_box_height+fJ.days_box_height+fJ.day_box_height+fJ.margin_offset+fJ.borderW})">
  ${tasks}
  </g>
  `;
  return taskSVG;
}

// genera te svg component for bottom bar / footing
function svg_footing() {
  let footingSVG = "";
  let fJ = progJSON.ganttchartFormat;
  let pJ = progJSON.projectdata;
  let tasksHeight = progJSON.taskJSON.length * fJ.task_box_height;
  let logoSVG = `
  <rect x="${fJ.margin_offset+fJ.borderW}" y="${fJ.margin_offset+fJ.borderW+fJ.title_box_height+fJ.days_box_height+fJ.day_box_height+tasksHeight}" width="${fJ.logo_box_width}" height="${fJ.logo_box_height}" style="fill:none; stroke:#222; stroke-width:1px" />
  <rect x="${fJ.margin_offset+fJ.borderW+fJ.logo_box_width}" y="${fJ.margin_offset+fJ.borderW+fJ.title_box_height+fJ.days_box_height+fJ.day_box_height+tasksHeight}" width="${title_box_width-fJ.logo_box_width}" height="${fJ.logo_box_height}" style="fill:none; stroke:#222; stroke-width:1px" />
  <rect x="${fJ.margin_offset+fJ.borderW}" y="${fJ.margin_offset+fJ.borderW+fJ.title_box_height+fJ.days_box_height+fJ.day_box_height+tasksHeight+fJ.logo_box_height}" width="${title_box_width}" height="${fJ.footing_box_height}" style="fill:none; stroke:#222; stroke-width:1px;" />
  <text x="${title_box_width}" y="${fJ.margin_offset+fJ.borderW+fJ.title_box_height+fJ.days_box_height+fJ.day_box_height+tasksHeight+fJ.logo_box_height+fJ.footing_box_height-fJ.task_text_offset_y}" text-anchor="end" font-size="${fJ.task_text_height}" font-family="${fJ.font_family}">version: ${pJ.version} | Update: ${pJ.dateofupdate}</text>
  <text x="${fJ.margin_offset+fJ.borderW+fJ.task_text_offset_x}" y="${fJ.margin_offset+fJ.borderW+fJ.title_box_height+fJ.days_box_height+fJ.day_box_height+tasksHeight+fJ.logo_box_height+fJ.footing_box_height-fJ.task_text_offset_y}" text-anchor="start" font-size="${fJ.task_text_height}" font-family="${fJ.font_family}">Prepared By: ${pJ.prepared}</text>
  `;
  footingSVG = `
  <g id="footingSVG">
    ${logoSVG}
  </g>
  `;
  return footingSVG;
}

// combine all components to form 'svg_final'
function svgFinalize() {
  // loop via taskJSON to sort latest day of program
  let tJ = progJSON.taskJSON;
  workingDay_number = 1;
  if(tJ.length>0) {
    for(i=0;i<tJ.length;i++) {
      if(tJ[i].end>workingDay_number) {workingDay_number=tJ[i].end}
    }
  }
  let fJ = progJSON.ganttchartFormat;
  // calc the height of the inner SVG
  svg_height = fJ.title_box_height + fJ.day_box_height + fJ.days_box_height + fJ.task_box_height*progJSON.taskJSON.length + fJ.logo_box_height + fJ.footing_box_height;
  // calc the width of the inner SVG
  title_box_width = fJ.item_col_width + fJ.desc_col_width + fJ.start_col_width + fJ.end_col_width + fJ.dur_col_width + (workingDay_number + fJ.end_day_extend + 1) * fJ.day_col_width;
  // call functions for every components
  let titleBoxSVG = svg_titleboxGen();
  let taskheadSVG = svg_taskheadGen();
  let daysHeadSVG = svg_daysHeadGen();
  let daybarSVG = svg_daybarGen();
  let taskSVG = svg_taskGen();
  let footingSVG = svg_footing();
  svg_final = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${title_box_width+4}" height="${svg_height+4}" preserveAspectRatio="xMinYMin meet">
    <rect x="0" y="0" width="${title_box_width+4}" height="${svg_height+4}" style="fill:#FFF" />
    ${titleBoxSVG}
    ${taskheadSVG}
    ${daysHeadSVG}
    ${daybarSVG}
    ${taskSVG}
    ${footingSVG}
  </svg>
  `;
}
// render 'svg_final' to PNG or other picture format
function renderSVG2PIC() {
  svgFinalize(); // generate SVG code and store in svg_final
  //let thumbnailPIC = document.getElementById('imgthumb');
  let imgW = title_box_width + (progJSON.ganttchartFormat.margin_offset + progJSON.ganttchartFormat.borderW) * 2;
  let imgH = svg_height + (progJSON.ganttchartFormat.margin_offset + progJSON.ganttchartFormat.borderW) * 2;
  let svgInline = svg_final;
  //let output = document.getElementById('thumbnailPIC');
  let output = document.getElementById('outPIC');
  let thumbPic = document.getElementById('thumbnailPIC');
  const svgDataBase64 = btoa(unescape(encodeURIComponent(svgInline)));
  const svgDataUrl = `data:image/svg+xml;charset=utf-8;base64,${svgDataBase64}`;
  const image = new Image();
  image.addEventListener('load', () => {
    const width = imgW;
    const height = imgH;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg');
    output.src = dataUrl;
    thumbPic.src = dataUrl;
  });
  image.src = svgDataUrl;
}

// run functions when body.onload
function init() {
  JSON2inputTable();
  renderSVG2PIC();
}

/*
Functions Coming Soon.....
// using AJAX to check and import external JSON
function readExtJSON() {}
// using AJAX to export current progJSON for download
function exportJSON() {}

=== template of progJSON.taskJSON ===
"taskJSON": [
  {"item":1, "desc":"Task #1", "start":1, "end":5, "dur":5},
  {"item":2, "desc":"Task #2", "start":3, "end":10, "dur":8},
  {"item":3, "desc":"Task #3", "start":8, "end":15, "dur":8}
]

refer:
https://jsfiddle.net/ourcodeworld/bqvmxz8w/13/

*/