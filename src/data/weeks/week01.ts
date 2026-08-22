import type { LearningWeek } from "@/types/learning";

const stage01 = {
  number: 1,
  title: "Digital Logic + Verilog",
} as const;

export const week01: LearningWeek = {
  id: "week01",
  week: 1,
  title: "基础RTL",
  days: [
    {
      id: "w01d01", stage: stage01, week: 1, day: 1, kind: "learning", title: "认识 FPGA、IC验证，并跑通第一个 Verilog 程序",
      description: "建立数字IC基础认知，理解FPGA、ASIC、IC验证之间的关系，并完成第一次Verilog代码运行。",
      estimatedMinutes: 90,
      topics: ["Binary", "AND", "OR", "NOT", "XOR", "module", "input", "output", "wire", "assign"],
      learn: [
        {
          id: "w01d01-learn-nandland-fpga101",
          title: "FPGA是什么",
          type: "VIDEO",
          url: "https://nandland.com/fpga-101/",
          platform: "Nandland",
          duration: 15,
          description: "只学习Introduction和What is FPGA；暂不学习LUT、Clock、FSM和Timing。",
          learningObjectives: [
            "理解FPGA是一种可重新配置数字逻辑芯片",
            "理解FPGA与CPU的主要区别",
            "知道为什么FPGA可以用于硬件验证",
          ],
          required: true,
        },
        {
          id: "w01d01-learn-hdlbits",
          title: "IC芯片设计流程",
          type: "ARTICLE",
          url: "https://www.synopsys.com/glossary/what-is-asic-design.html",
          platform: "Synopsys",
          duration: 15,
          description: "了解需求、RTL设计、IC验证、综合、布局布线和流片之间的关系。",
          learningObjectives: [
            "知道IC验证在芯片流程中的位置",
            "理解IC验证工程师主要职责",
          ],
          required: true,
        },
        {
          id: "w01d01-learn-nandland-verilog",
          title: "Learn Verilog",
          type: "ARTICLE",
          url: "https://nandland.com/learn-verilog/",
          platform: "Nandland",
          duration: 20,
          description: "可选浏览Nandland Verilog入门内容，重点认识module和assign。",
          learningObjectives: [
            "了解Verilog用于描述硬件",
            "理解module和assign基本概念",
          ],
          required: false,
        },
        {
          id: "w01d01-learn-cn-fpga-intro",
          title: "FPGA是什么（中文讲解）",
          type: "ARTICLE",
          url: "https://doc.embedfire.com/fpga/altera/ep4ce10_mini/zh/latest/fpga/First_knowledge_FPGA.html",
          platform: "野火电子",
          duration: 15,
          description: "只阅读“FPGA是什么”相关内容；暂不学习FPGA内部资源、开发板、LUT、Clock、FSM和Timing。",
          learningObjectives: [
            "理解FPGA是可配置的数字逻辑芯片",
            "理解FPGA与CPU执行方式的区别",
          ],
          required: false,
        },
        {
          id: "w01d01-learn-cn-verilog-basics",
          title: "Verilog基础语法（中文讲解）",
          type: "ARTICLE",
          url: "https://doc.embedfire.com/fpga/altera/ep4ce10_pro/zh/latest/code/first_veriloghdl.html",
          platform: "野火电子",
          duration: 20,
          description: "只学习module、input、output、wire和assign，不要求学习高级语法。",
          learningObjectives: [
            "理解module是硬件模块",
            "理解input和output端口",
            "理解wire和assign的基础作用",
          ],
          required: false,
        },
        {
          id: "w01d01-learn-cn-mooc-fpga",
          title: "数字设计FPGA应用（中文课程）",
          type: "VIDEO",
          url: "https://www.icourse163.org/course/UESTC-1002525007",
          platform: "中国大学MOOC",
          duration: 20,
          description: "仅作为扩展参考，不要求完成整门课程；Day1只参考FPGA介绍和Verilog基本结构相关内容。",
          learningObjectives: [
            "通过中文视频辅助理解FPGA和Verilog基础概念",
          ],
          required: false,
        },
      ],
      softwareRequirements: [
        {
          id: "w01d01-software-iverilog",
          name: "Icarus Verilog",
          purpose: "运行第一个Verilog程序",
          installUrl: "https://www.bleyer.org/icarus/iverilog-v14-20260804-x64_setup.exe",
          verificationSteps: [
            "下载Windows安装程序",
            "运行安装程序，并在安装过程中勾选 Add executable folder(s) to the user PATH",
            "完成安装后关闭旧终端，再打开PowerShell",
            "在PowerShell中执行 iverilog -V",
            "看到Icarus Verilog版本信息表示安装成功",
            "常见错误：如果提示“iverilog不是内部或外部命令”，说明PATH未配置；请重新运行安装程序并启用PATH选项，然后重新打开PowerShell",
          ],
          required: true,
        },
        {
          id: "w01d01-software-vscode",
          name: "Visual Studio Code",
          purpose: "编辑Verilog文件",
          installUrl: "https://code.visualstudio.com/download",
          verificationSteps: [],
          required: false,
        },
        {
          id: "w01d01-software-gtkwave",
          name: "GTKWave",
          purpose: "后续查看波形",
          installUrl: "https://gtkwave.sourceforge.net/",
          verificationSteps: [],
          required: false,
        },
      ],
      practice: [
        {
          id: "w01d01-practice-hdlbits-basic",
          title: "FPGA是什么？",
          target: "A CPU　B 可以重新配置数字逻辑的芯片　C 操作系统｜答案：B｜解释：FPGA核心特点是可以通过硬件描述语言配置内部逻辑。",
          options: [
            { id: "A", label: "CPU" },
            { id: "B", label: "可以重新配置数字逻辑的芯片" },
            { id: "C", label: "操作系统" },
          ],
          correctOptionId: "B",
          explanation: "FPGA核心特点是可以通过硬件描述语言配置内部逻辑。",
          required: true,
        },
        {
          id: "w01d01-practice-verilog-purpose",
          title: "Verilog主要用于什么？",
          target: "A 写网页　B 描述硬件电路　C 写数据库｜答案：B",
          options: [
            { id: "A", label: "写网页" },
            { id: "B", label: "描述硬件电路" },
            { id: "C", label: "写数据库" },
          ],
          correctOptionId: "B",
          explanation: "Verilog是硬件描述语言，用来描述数字电路的结构和行为。",
          required: true,
        },
        {
          id: "w01d01-practice-verification-role",
          title: "IC验证工程师主要负责什么？",
          target: "A 制造晶圆　B 检查芯片设计是否符合要求　C 开发手机应用｜答案：B",
          options: [
            { id: "A", label: "制造晶圆" },
            { id: "B", label: "检查芯片设计是否符合要求" },
            { id: "C", label: "开发手机应用" },
          ],
          correctOptionId: "B",
          explanation: "IC验证工程师通过检查和仿真发现设计问题，确认芯片设计符合需求。",
          required: true,
        },
        {
          id: "w01d01-practice-assign-and",
          title: "assign y = a & b; 表示什么？",
          target: "A 软件执行一次AND　B 一个AND逻辑电路｜答案：B",
          options: [
            { id: "A", label: "软件执行一次AND" },
            { id: "B", label: "一个AND逻辑电路" },
          ],
          correctOptionId: "B",
          explanation: "assign持续驱动y；按位与运算符&表示由输入a和b形成的AND逻辑。",
          required: true,
        },
        {
          id: "w01d01-practice-fpga-cpu-difference",
          title: "FPGA和CPU最大的区别是什么？",
          target: "答案：CPU执行程序，FPGA配置硬件逻辑。",
          options: [
            { id: "A", label: "CPU执行程序，FPGA配置硬件逻辑" },
            { id: "B", label: "CPU配置硬件逻辑，FPGA执行程序" },
            { id: "C", label: "两者没有区别" },
          ],
          correctOptionId: "A",
          explanation: "CPU按指令执行程序；FPGA通过配置内部数字逻辑来实现硬件功能。",
          required: true,
        },
      ],
      build: [{
        id: "w01d01-build-gates",
        title: "第一次Verilog实验：AND Gate",
        requirements: ["创建并运行第一个Verilog模块"],
        requiresTestbench: false,
        requiresSimulation: true,
        requiresWaveform: false,
        deliverables: ["and_gate.v文件", "成功编译结果"],
        starterCode: `module and_gate(
  input a,
  input b,
  output y
);

  // TODO

endmodule`,
        steps: [
          {
            stepNumber: 1,
            title: "创建实验文件夹",
            description: "在终端创建 Day1 实验目录，后续文件都放在这个目录中。",
            command: "mkdir day1-and-gate",
            expectedResult: "当前路径下出现 day1-and-gate 文件夹。",
          },
          {
            stepNumber: 2,
            title: "进入实验目录",
            description: "切换到刚刚创建的目录。",
            command: "cd day1-and-gate",
            expectedResult: "终端当前路径以 day1-and-gate 结尾。",
          },
          {
            stepNumber: 3,
            title: "创建 and_gate.v",
            description: "新建 and_gate.v，把下方 Starter Code 复制到文件中。",
            expectedResult: "目录中存在 and_gate.v，文件内容包含 module and_gate。",
          },
          {
            stepNumber: 4,
            title: "补充 AND 逻辑",
            description: "把 // TODO 替换为 assign y = a & b;，然后保存文件。",
            expectedResult: "模块中包含 assign y = a & b;。",
          },
          {
            stepNumber: 5,
            title: "编译 Verilog 代码",
            description: "使用 Icarus Verilog 编译 and_gate.v。",
            command: "iverilog and_gate.v",
            expectedResult: "终端没有显示 error，并生成 a.out。",
          },
          {
            stepNumber: 6,
            title: "运行编译结果",
            description: "执行 Icarus Verilog 生成的程序，确认代码能够正常运行。",
            command: "vvp a.out",
            expectedResult: "命令正常结束且没有 error；本实验没有 testbench，因此不会打印逻辑结果。",
          },
        ],
        commands: ["iverilog and_gate.v", "vvp a.out"],
        expectedOutput: ["编译成功，无 error，并生成 a.out", "运行成功，无 error"],
        verificationMethod: "simulation",
      }],
      debug: [],
      passCriteria: [
        { id: "w01d01-pass-gates", label: "能够解释FPGA是什么" },
        { id: "w01d01-pass-module", label: "能够解释FPGA和CPU的区别" },
        { id: "w01d01-pass-io", label: "能够解释IC验证工程师做什么" },
        { id: "w01d01-pass-wire", label: "Icarus Verilog安装成功" },
        { id: "w01d01-pass-assign", label: "执行iverilog -V能够显示版本信息" },
        { id: "w01d01-pass-run", label: "AND Gate代码成功编译" },
      ],
    },
    {
      id: "w01d02", stage: stage01, week: 1, day: 2, kind: "learning", title: "数字逻辑基础：从逻辑门到 Verilog",
      description: "理解数字电路中的基本逻辑门，并学习如何使用Verilog描述简单组合逻辑。",
      estimatedMinutes: 90,
      topics: [
        "理解数字电路为什么使用0和1表示信息",
        "理解AND、OR、NOT三种基本逻辑门",
        "能够阅读简单真值表",
        "理解assign用于描述组合逻辑",
        "完成三个基础逻辑门Verilog模块",
      ],
      learn: [
        {
          id: "w01d02-learn-binary-levels",
          title: "数字电路为什么使用0和1",
          type: "ARTICLE",
          url: "https://learn.sparkfun.com/tutorials/logicblocks--digital-logic-introduction/what-is-digital-logic",
          platform: "SparkFun Learn",
          duration: 15,
          description: "学习高电平和低电平如何表示数字状态，理解数字电路用两个稳定状态处理信息的基础思想。",
          learningObjectives: [
            "理解高低电平表示数字状态",
            "理解数字电路基础思想",
          ],
          required: true,
        },
        {
          id: "w01d02-learn-logic-gates",
          title: "Logic Gates基础",
          type: "ARTICLE",
          url: "https://learn.sparkfun.com/tutorials/digital-logic/all",
          platform: "SparkFun Learn",
          duration: 25,
          description: "学习AND、OR、NOT三种基本逻辑门，并结合输入输出组合阅读对应真值表。",
          learningObjectives: [
            "理解AND逻辑",
            "理解OR逻辑",
            "理解NOT逻辑",
            "能够阅读真值表",
          ],
          required: true,
        },
        {
          id: "w01d02-learn-verilog-combinational",
          title: "Verilog组合逻辑基础",
          type: "ARTICLE",
          url: "https://verilogguide.readthedocs.io/en/latest/verilog/designs.html",
          platform: "Verilog Design Guide",
          duration: 20,
          description: "学习module的基本结构，使用assign持续描述组合逻辑，并认识&、|、~三个按位逻辑运算符。",
          learningObjectives: [
            "理解module",
            "理解assign",
            "理解& | ~运算符",
          ],
          required: true,
        },
      ],
      softwareRequirements: [],
      practice: [
        {
          id: "w01d02-practice-hdlbits-mux",
          title: "AND门什么时候输出1？",
          options: [
            { id: "A", label: "任意一个输入是1" },
            { id: "B", label: "两个输入都是1" },
            { id: "C", label: "两个输入都是0" },
          ],
          correctOptionId: "B",
          explanation: "AND逻辑要求所有输入同时为1时，输出才为1。",
          required: true,
        },
        {
          id: "w01d02-practice-or-zero",
          title: "0 OR 0 的结果是什么？",
          options: [
            { id: "A", label: "0" },
            { id: "B", label: "1" },
            { id: "C", label: "不确定" },
          ],
          correctOptionId: "A",
          explanation: "OR逻辑只要有一个输入为1就输出1；两个输入都为0时输出0。",
          required: true,
        },
        {
          id: "w01d02-practice-assign-and",
          title: "assign y = a & b; 表示什么？",
          options: [
            { id: "A", label: "AND组合逻辑" },
            { id: "B", label: "OR组合逻辑" },
            { id: "C", label: "NOT组合逻辑" },
          ],
          correctOptionId: "A",
          explanation: "按位与运算符&对a和b执行AND逻辑，assign持续把结果驱动到y。",
          required: true,
        },
        {
          id: "w01d02-practice-not-zero",
          title: "NOT门输入0时输出什么？",
          options: [
            { id: "A", label: "0" },
            { id: "B", label: "1" },
          ],
          correctOptionId: "B",
          explanation: "NOT门会把输入取反，因此输入0时输出1。",
          required: true,
        },
        {
          id: "w01d02-practice-assign-purpose",
          title: "assign的作用是什么？",
          options: [
            { id: "A", label: "描述组合逻辑连接" },
            { id: "B", label: "暂停仿真" },
            { id: "C", label: "安装编译器" },
          ],
          correctOptionId: "A",
          explanation: "assign用于连续赋值，常用来描述简单组合逻辑及信号之间的连接。",
          required: true,
        },
      ],
      build: [{
        id: "w01d02-build-mux2",
        title: "实现三个基础逻辑门",
        requirements: ["创建logic_gate.v，并完成AND、OR、NOT三个Verilog模块"],
        requiresTestbench: false,
        requiresSimulation: true,
        requiresWaveform: false,
        deliverables: ["logic_gate.v"],
        starterCode: `module and_gate(
  input a,
  input b,
  output y
);

  // TODO: AND logic

endmodule

module or_gate(
  input a,
  input b,
  output y
);

  // TODO: OR logic

endmodule

module not_gate(
  input a,
  output y
);

  // TODO: NOT logic

endmodule`,
        steps: [
          {
            stepNumber: 1,
            title: "创建 logic_gate.v 文件",
            description: "在Day2实验目录中新建logic_gate.v，并复制下方Starter Code。",
            expectedResult: "文件中包含and_gate、or_gate和not_gate三个模块框架。",
          },
          {
            stepNumber: 2,
            title: "完成AND逻辑",
            description: "在and_gate模块中使用assign和&运算符连接输出y。",
            expectedResult: "and_gate包含assign y = a & b;。",
          },
          {
            stepNumber: 3,
            title: "完成OR逻辑",
            description: "在or_gate模块中使用assign和|运算符连接输出y。",
            expectedResult: "or_gate包含assign y = a | b;。",
          },
          {
            stepNumber: 4,
            title: "完成NOT逻辑",
            description: "在not_gate模块中使用assign和~运算符连接输出y。",
            expectedResult: "not_gate包含assign y = ~a;。",
          },
          {
            stepNumber: 5,
            title: "使用Icarus Verilog编译",
            description: "保存文件后，在终端编译三个模块。",
            command: "iverilog logic_gate.v",
            expectedResult: "编译完成，终端不显示error。",
          },
        ],
        commands: ["iverilog logic_gate.v"],
        verificationMethod: "simulation",
        expectedOutput: ["编译成功，无error"],
      }],
      debug: [{
        id: "w01d02-debug-and-operators",
        title: "区分 & 和 &&",
        prompt: "错误代码：assign y = a && b;。观察&&与&的写法，思考描述单比特逻辑门时为什么应使用按位与运算符&。",
        expectedOutcome: "理解&是按位与运算符，&&是逻辑与运算符；本实验应写assign y = a & b;。",
      }],
      passCriteria: [
        { id: "w01d02-pass-explain", label: "能够解释AND、OR、NOT逻辑" },
        { id: "w01d02-pass-draw", label: "能够阅读基本真值表" },
        { id: "w01d02-pass-write", label: "Practice全部通过" },
        { id: "w01d02-pass-sim", label: "三个逻辑门代码编译成功" },
        { id: "w01d02-pass-assign", label: "理解assign描述组合逻辑" },
      ],
    },
    {
      id: "w01d03", stage: stage01, week: 1, day: 3, kind: "learning", title: "Decoder / Encoder",
      topics: ["Decoder", "Encoder", "case"], learn: [], practice: [],
      build: [{ id: "w01d03-build-decoder", title: "实现2-to-4 Decoder", requirements: ["练习case", "Testbench验证所有输入组合"], requiresTestbench: true, requiresSimulation: true, requiresWaveform: false, deliverables: ["2-to-4 Decoder", "Testbench"] }],
      debug: [],
      passCriteria: [
        { id: "w01d03-pass-explain", label: "能解释Decoder" }, { id: "w01d03-pass-case", label: "可以用case写Decoder" },
        { id: "w01d03-pass-tb", label: "能写Testbench验证所有输入组合" },
      ],
    },
    {
      id: "w01d04", stage: stage01, week: 1, day: 4, kind: "learning", title: "Adder",
      topics: ["Half Adder", "Full Adder", "Carry"], learn: [], practice: [],
      build: [
        { id: "w01d04-build-half", title: "实现Half Adder", requirements: ["Testbench覆盖所有输入组合"], requiresTestbench: true, requiresSimulation: true, requiresWaveform: false, deliverables: ["Half Adder", "Testbench"] },
        { id: "w01d04-build-full", title: "实现Full Adder", requirements: ["Testbench覆盖所有输入组合"], requiresTestbench: true, requiresSimulation: true, requiresWaveform: false, deliverables: ["Full Adder", "Testbench"] },
        { id: "w01d04-build-challenge", title: "连接多个Full Adder理解多位加法器", requirements: ["额外挑战"], requiresTestbench: false, requiresSimulation: false, requiresWaveform: false, deliverables: ["多位加法器连接练习"] },
      ],
      debug: [],
      passCriteria: [
        { id: "w01d04-pass-carry", label: "能解释sum和carry" }, { id: "w01d04-pass-half", label: "能自己写Half Adder" },
        { id: "w01d04-pass-full", label: "能自己写Full Adder" }, { id: "w01d04-pass-tb", label: "Testbench覆盖所有输入组合" },
      ],
    },
    {
      id: "w01d05", stage: stage01, week: 1, day: 5, kind: "learning", title: "always组合逻辑",
      topics: ["always @(*)", "if", "case", "continuous assignment", "procedural combinational logic"], learn: [], practice: [],
      build: [
        { id: "w01d05-build-assign", title: "使用assign实现MUX", requirements: ["assign版本"], requiresTestbench: true, requiresSimulation: true, requiresWaveform: false, deliverables: ["assign版本MUX"] },
        { id: "w01d05-build-always", title: "使用always实现MUX", requirements: ["always版本"], requiresTestbench: true, requiresSimulation: true, requiresWaveform: false, deliverables: ["always版本MUX"] },
        { id: "w01d05-build-compare", title: "比较两种MUX写法的结果", requirements: ["两种MUX仿真结果一致"], requiresTestbench: true, requiresSimulation: true, requiresWaveform: false, deliverables: ["比较结果"] },
      ],
      debug: [],
      passCriteria: [
        { id: "w01d05-pass-assign", label: "知道assign什么时候使用" }, { id: "w01d05-pass-always", label: "知道always @(*)基本用途" },
        { id: "w01d05-pass-if-case", label: "可以用if/case描述组合逻辑" }, { id: "w01d05-pass-match", label: "两种MUX仿真结果一致" },
      ],
    },
    {
      id: "w01d06", stage: stage01, week: 1, day: 6, kind: "learning", title: "综合练习",
      topics: ["不要学习大量新内容", "不复制教程"], learn: [], practice: [],
      build: [
        { id: "w01d06-build-mux2", title: "从空白完成2:1 MUX", requirements: ["不复制教程"], requiresTestbench: true, requiresSimulation: true, requiresWaveform: false, deliverables: ["2:1 MUX"] },
        { id: "w01d06-build-mux4", title: "从空白完成4:1 MUX", requirements: ["不复制教程"], requiresTestbench: true, requiresSimulation: true, requiresWaveform: false, deliverables: ["4:1 MUX"] },
        { id: "w01d06-build-decoder", title: "从空白完成Decoder", requirements: ["不复制教程"], requiresTestbench: true, requiresSimulation: true, requiresWaveform: false, deliverables: ["Decoder"] },
        { id: "w01d06-build-half", title: "从空白完成Half Adder", requirements: ["不复制教程"], requiresTestbench: true, requiresSimulation: true, requiresWaveform: false, deliverables: ["Half Adder"] },
        { id: "w01d06-build-full", title: "从空白完成Full Adder", requirements: ["不复制教程"], requiresTestbench: true, requiresSimulation: true, requiresWaveform: false, deliverables: ["Full Adder"] },
        { id: "w01d06-build-tb", title: "统一写Testbench", requirements: ["编译无错误", "Testbench运行成功"], requiresTestbench: true, requiresSimulation: true, requiresWaveform: false, deliverables: ["统一Testbench"] },
      ],
      debug: [],
      passCriteria: [
        { id: "w01d06-pass-modules", label: "5个模块全部完成" }, { id: "w01d06-pass-compile", label: "编译无错误" },
        { id: "w01d06-pass-tb", label: "Testbench运行成功" }, { id: "w01d06-pass-fix", label: "出错时能根据编译信息修改代码" },
      ],
    },
    {
      id: "w01d07", stage: stage01, week: 1, day: 7, kind: "checkpoint", title: "Week 1 Checkpoint",
      topics: ["今天不看新课程"], learn: [], practice: [], build: [], debug: [],
      passCriteria: [
        { id: "w01d07-pass-mux2", label: "不查答案写2:1 MUX" }, { id: "w01d07-pass-mux4", label: "不查答案写4:1 MUX" },
        { id: "w01d07-pass-full", label: "不查答案写Full Adder" }, { id: "w01d07-pass-syntax", label: "解释module/input/output/wire/assign" },
        { id: "w01d07-pass-comb", label: "解释什么是组合逻辑" }, { id: "w01d07-pass-sim", label: "使用iverilog完成一次编译和仿真" },
        { id: "w01d07-pass-hdlbits", label: "检查HDLBits完成数量" },
      ],
    },
  ],
};
