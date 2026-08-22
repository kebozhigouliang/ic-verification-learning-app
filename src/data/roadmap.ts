import type {
  LearningStage,
  RoadmapStage,
  RoadmapWeek,
} from "@/types/roadmap";
import { roadmapResourcesByWeek } from "@/data/roadmapResources";

type RoadmapWeekDefinition = Omit<RoadmapWeek, "days" | "resources">;

function defineWeek(week: RoadmapWeekDefinition): RoadmapWeek {
  const resources = roadmapResourcesByWeek[week.id] ?? [];
  return {
    ...week,
    resources,
    days: [
      {
        id: `roadmap-${week.id}-plan`,
        title: week.title,
        topics: week.topics,
        resources,
        tasks: week.tasks,
        passCriteria: [],
      },
    ],
  };
}

export const learningRoadmap: LearningStage[] = [
  {
    id: "stage01",
    title: "Digital Logic + Verilog",
    description: "从数字逻辑、Verilog语法和Testbench基础逐步进入RTL设计、仿真与调试。",
    duration: "Week 1-4",
    skills: ["Digital Logic", "Verilog", "Testbench", "Debug"],
    weeks: [
      defineWeek({
        id: "week01",
        title: "数字逻辑基础",
        goal: "理解数字系统基础，为 Verilog 学习准备。",
        topics: [
          "Binary",
          "Boolean Algebra",
          "Logic Gates",
          "Combinational Logic",
          "Sequential Logic",
          "Flip Flop",
          "FSM",
        ],
        tasks: [
          {
            id: "roadmap-week01-learn-binary-logic",
            category: "learn",
            title: "学习二进制和逻辑运算",
          },
          {
            id: "roadmap-week01-learn-combinational-sequential",
            category: "learn",
            title: "理解组合逻辑和时序逻辑",
          },
          {
            id: "roadmap-week01-practice-hdlbits-basic",
            category: "practice",
            title: "HDLBits基础题",
          },
          {
            id: "roadmap-week01-build-basic-logic-library",
            category: "build",
            title: "Basic Logic Library",
            deliverables: [
              "AND Gate",
              "OR Gate",
              "XOR Gate",
              "MUX",
              "Decoder",
              "Encoder",
              "Counter",
            ],
          },
        ],
        projectReferences: ["project-basic-logic-library"],
      }),
      defineWeek({
        id: "week02",
        title: "Verilog基础",
        goal: "掌握 Verilog 基本语法，并完成 UART Transmitter。",
        topics: [
          "module",
          "input/output",
          "wire",
          "reg",
          "assign",
          "always block",
          "parameter",
          "generate",
        ],
        tasks: [
          {
            id: "roadmap-week02-learn-verilog-syntax",
            category: "learn",
            title: "Verilog基本语法",
          },
          {
            id: "roadmap-week02-practice-hdlbits-verilog",
            category: "practice",
            title: "HDLBits Verilog基础",
          },
          {
            id: "roadmap-week02-build-uart-transmitter",
            category: "build",
            title: "UART Transmitter",
          },
        ],
        projectReferences: ["project-uart-verification"],
      }),
      defineWeek({
        id: "week03",
        title: "Testbench基础",
        goal: "掌握基础验证流程，并完成 UART Verification Environment。",
        topics: ["stimulus", "monitor", "checker", "waveform", "simulation"],
        tasks: [
          {
            id: "roadmap-week03-build-uart-verification-environment",
            category: "build",
            title: "UART Verification Environment",
          },
        ],
        projectReferences: ["project-uart-verification"],
      }),
      defineWeek({
        id: "week04",
        title: "Debug与综合实践",
        goal: "通过波形和逻辑调试改进 Testbench，并完成 FIFO RTL + Testbench。",
        topics: [
          "waveform debugging",
          "logic bug",
          "timing bug",
          "testbench improvement",
        ],
        tasks: [
          {
            id: "roadmap-week04-build-fifo-rtl-testbench",
            category: "build",
            title: "FIFO RTL + Testbench",
          },
        ],
        projectReferences: ["project-fifo-verification"],
      }),
    ],
  },
  {
    id: "stage02",
    title: "SystemVerilog Fundamentals",
    description: "学习SystemVerilog数据类型、面向对象、约束随机和基础验证特性。",
    duration: "Week 5-8",
    skills: ["SystemVerilog", "OOP", "Constraint Random", "Assertions", "Coverage"],
    weeks: [
      defineWeek({
        id: "week05",
        title: "SystemVerilog语言基础",
        goal: "掌握SystemVerilog常用数据类型、过程块与接口基础。",
        topics: ["logic", "bit", "enum", "struct", "array", "function", "task", "interface"],
        tasks: [
          { id: "roadmap-week05-learn-sv-types", category: "learn", title: "学习SystemVerilog数据类型与过程结构" },
          { id: "roadmap-week05-practice-sv-syntax", category: "practice", title: "完成SystemVerilog基础语法练习" },
          { id: "roadmap-week05-build-interface-testbench", category: "build", title: "使用interface连接FIFO Testbench" },
        ],
        projectReferences: ["project-fifo-verification"],
      }),
      defineWeek({
        id: "week06",
        title: "Class与面向对象",
        goal: "理解class、object、继承和多态，并用事务对象描述验证数据。",
        topics: ["class", "object", "constructor", "inheritance", "polymorphism", "virtual method", "package"],
        tasks: [
          { id: "roadmap-week06-learn-sv-oop", category: "learn", title: "学习SystemVerilog面向对象基础" },
          { id: "roadmap-week06-practice-transaction-class", category: "practice", title: "编写并操作transaction class" },
          { id: "roadmap-week06-build-fifo-transaction", category: "build", title: "为FIFO验证建立事务数据模型" },
        ],
        projectReferences: ["project-fifo-verification"],
      }),
      defineWeek({
        id: "week07",
        title: "约束随机与Mailbox",
        goal: "生成合法随机激励，并使用mailbox组织验证组件通信。",
        topics: ["randomize", "rand", "constraint", "inside", "distribution", "mailbox", "event"],
        tasks: [
          { id: "roadmap-week07-learn-constrained-random", category: "learn", title: "学习约束随机的执行规则" },
          { id: "roadmap-week07-practice-random-constraints", category: "practice", title: "编写FIFO事务约束" },
          { id: "roadmap-week07-build-generator-driver", category: "build", title: "实现Generator到Driver的数据传递" },
        ],
        projectReferences: ["project-fifo-verification"],
      }),
      defineWeek({
        id: "week08",
        title: "Assertion与Coverage基础",
        goal: "使用基础断言和功能覆盖衡量FIFO验证完整性。",
        topics: ["immediate assertion", "concurrent assertion", "property", "covergroup", "coverpoint", "cross coverage"],
        tasks: [
          { id: "roadmap-week08-learn-assertion-coverage", category: "learn", title: "学习Assertion与Functional Coverage基础" },
          { id: "roadmap-week08-practice-fifo-properties", category: "practice", title: "为FIFO边界行为编写断言" },
          { id: "roadmap-week08-build-fifo-coverage", category: "build", title: "为FIFO验证加入功能覆盖" },
        ],
        projectReferences: ["project-fifo-verification"],
      }),
    ],
  },
  {
    id: "stage03",
    title: "Verification Methodology",
    description: "建立可复用验证环境的方法论，覆盖计划、架构、覆盖率、回归与调试。",
    duration: "Week 9-12",
    skills: ["Verification Planning", "Self-checking Testbench", "Coverage", "Regression", "Debug"],
    weeks: [
      defineWeek({
        id: "week09",
        title: "Verification Plan",
        goal: "把设计需求转换为可执行、可追踪的验证计划。",
        topics: ["specification", "feature list", "test plan", "corner case", "traceability", "exit criteria"],
        tasks: [
          { id: "roadmap-week09-learn-verification-plan", category: "learn", title: "学习验证计划的组成" },
          { id: "roadmap-week09-practice-fifo-testpoints", category: "practice", title: "从FIFO规格提取testpoints" },
          { id: "roadmap-week09-build-fifo-testplan", category: "build", title: "编写FIFO Verification Plan" },
        ],
        projectReferences: ["project-fifo-verification"],
      }),
      defineWeek({
        id: "week10",
        title: "Self-checking Testbench",
        goal: "建立driver、monitor、reference model和scoreboard组成的自检查环境。",
        topics: ["generator", "driver", "monitor", "reference model", "scoreboard", "transaction"],
        tasks: [
          { id: "roadmap-week10-learn-testbench-architecture", category: "learn", title: "理解分层Testbench架构" },
          { id: "roadmap-week10-practice-scoreboard-checking", category: "practice", title: "设计期望值与实际值比对规则" },
          { id: "roadmap-week10-build-fifo-self-checking", category: "build", title: "完成FIFO Self-checking Testbench" },
        ],
        projectReferences: ["project-fifo-verification"],
      }),
      defineWeek({
        id: "week11",
        title: "Coverage与Closure",
        goal: "理解代码覆盖与功能覆盖的差异，并根据覆盖缺口补充测试。",
        topics: ["code coverage", "functional coverage", "coverage model", "coverage hole", "waiver", "coverage closure"],
        tasks: [
          { id: "roadmap-week11-learn-coverage-strategy", category: "learn", title: "学习Coverage Strategy" },
          { id: "roadmap-week11-practice-coverage-analysis", category: "practice", title: "分析FIFO覆盖缺口" },
          { id: "roadmap-week11-build-coverage-closure", category: "build", title: "补充定向与随机测试完成Coverage Closure" },
        ],
        projectReferences: ["project-fifo-verification"],
      }),
      defineWeek({
        id: "week12",
        title: "Regression与Debug",
        goal: "组织可重复回归并形成结构化失败定位流程。",
        topics: ["test list", "seed", "regression", "log triage", "waveform debug", "root cause", "bug report"],
        tasks: [
          { id: "roadmap-week12-learn-regression-debug", category: "learn", title: "学习Regression与Debug流程" },
          { id: "roadmap-week12-debug-failing-seed", category: "debug", title: "复现并定位一个失败seed" },
          { id: "roadmap-week12-build-regression-script", category: "build", title: "建立FIFO Regression入口和结果摘要" },
        ],
        projectReferences: ["project-fifo-verification"],
      }),
    ],
  },
  {
    id: "stage04",
    title: "UVM",
    description: "掌握UVM组件、phase、sequence机制、TLM通信与可复用环境组装。",
    duration: "Week 13-16",
    skills: ["UVM Components", "UVM Phases", "Sequences", "TLM", "Factory", "Configuration"],
    weeks: [
      defineWeek({
        id: "week13",
        title: "UVM基础与Component",
        goal: "理解UVM验证环境层级、组件生命周期和phase执行顺序。",
        topics: ["uvm_component", "uvm_object", "build_phase", "connect_phase", "run_phase", "factory", "config_db"],
        tasks: [
          { id: "roadmap-week13-learn-uvm-components", category: "learn", title: "学习UVM组件与Phase" },
          { id: "roadmap-week13-practice-uvm-hierarchy", category: "practice", title: "绘制并解释UVM环境层级" },
          { id: "roadmap-week13-build-uvm-test-skeleton", category: "build", title: "建立可运行的UVM Test骨架" },
        ],
        projectReferences: ["project-apb-slave-verification"],
      }),
      defineWeek({
        id: "week14",
        title: "Sequence与Driver",
        goal: "从sequence_item生成事务，并通过sequencer和driver驱动DUT。",
        topics: ["sequence_item", "sequence", "sequencer", "driver", "start_item", "finish_item", "virtual interface"],
        tasks: [
          { id: "roadmap-week14-learn-sequence-driver", category: "learn", title: "学习Sequence到Driver的数据流" },
          { id: "roadmap-week14-practice-sequence-item", category: "practice", title: "编写可随机化的协议sequence_item" },
          { id: "roadmap-week14-build-apb-driver", category: "build", title: "实现APB Sequence、Sequencer与Driver" },
        ],
        projectReferences: ["project-apb-slave-verification"],
      }),
      defineWeek({
        id: "week15",
        title: "Monitor与Scoreboard",
        goal: "使用analysis port广播监测事务，并在scoreboard中自动检查结果。",
        topics: ["monitor", "analysis_port", "analysis_export", "subscriber", "scoreboard", "reference model"],
        tasks: [
          { id: "roadmap-week15-learn-uvm-analysis", category: "learn", title: "学习UVM Analysis通信" },
          { id: "roadmap-week15-practice-transaction-checking", category: "practice", title: "定义协议事务比对策略" },
          { id: "roadmap-week15-build-apb-monitor-scoreboard", category: "build", title: "实现APB Monitor与Scoreboard" },
        ],
        projectReferences: ["project-apb-slave-verification"],
      }),
      defineWeek({
        id: "week16",
        title: "Agent、Environment与Regression",
        goal: "组装完整UVM环境，配置主动/被动Agent并执行回归。",
        topics: ["agent", "environment", "active agent", "passive agent", "configuration", "objection", "reporting", "regression"],
        tasks: [
          { id: "roadmap-week16-learn-uvm-environment", category: "learn", title: "学习Agent和Environment组装" },
          { id: "roadmap-week16-practice-uvm-configuration", category: "practice", title: "练习Factory与Config DB配置" },
          { id: "roadmap-week16-build-apb-uvm-environment", category: "build", title: "完成APB UVM Verification Environment" },
        ],
        projectReferences: ["project-apb-slave-verification"],
      }),
    ],
  },
  {
    id: "stage05",
    title: "Protocol Verification",
    description: "学习常见片上协议并建立从规格、激励、检查到覆盖率的协议验证能力。",
    duration: "Week 17-20",
    skills: ["APB", "SPI", "AXI", "Protocol Assertions", "Protocol Coverage"],
    weeks: [
      defineWeek({
        id: "week17",
        title: "APB协议验证",
        goal: "理解APB状态转换和握手规则，并验证APB Slave。",
        topics: ["PSEL", "PENABLE", "PREADY", "PWRITE", "PRDATA", "PWDATA", "PSLVERR", "wait state"],
        tasks: [
          { id: "roadmap-week17-learn-apb-protocol", category: "learn", title: "学习APB传输与时序" },
          { id: "roadmap-week17-practice-apb-scenarios", category: "practice", title: "列出APB正常与异常场景" },
          { id: "roadmap-week17-build-apb-slave-verification", category: "build", title: "完善APB Slave Verification" },
        ],
        projectReferences: ["project-apb-slave-verification"],
      }),
      defineWeek({
        id: "week18",
        title: "SPI协议验证",
        goal: "理解SPI模式、帧结构与主从交互，并建立SPI验证环境。",
        topics: ["SCLK", "MOSI", "MISO", "chip select", "CPOL", "CPHA", "full duplex", "frame"],
        tasks: [
          { id: "roadmap-week18-learn-spi-protocol", category: "learn", title: "学习SPI时序与四种模式" },
          { id: "roadmap-week18-practice-spi-testpoints", category: "practice", title: "设计SPI协议testpoints" },
          { id: "roadmap-week18-build-spi-uvm", category: "build", title: "建立SPI UVM Verification Environment" },
        ],
        projectReferences: ["project-spi-uvm"],
      }),
      defineWeek({
        id: "week19",
        title: "AXI协议基础",
        goal: "理解AXI五通道与VALID/READY握手，并验证基础读写事务。",
        topics: ["AXI channels", "VALID", "READY", "burst", "ID", "outstanding", "ordering", "response"],
        tasks: [
          { id: "roadmap-week19-learn-axi-handshake", category: "learn", title: "学习AXI通道与VALID/READY机制" },
          { id: "roadmap-week19-practice-axi-timing", category: "practice", title: "分析AXI读写时序和backpressure" },
          { id: "roadmap-week19-build-axi-lite-monitor", category: "build", title: "实现AXI-Lite Monitor与基础Checker" },
        ],
        projectReferences: ["project-axi-apb-spi"],
      }),
      defineWeek({
        id: "week20",
        title: "协议集成验证",
        goal: "验证AXI/APB/SPI子系统中的地址、数据和错误传播路径。",
        topics: ["protocol bridge", "address map", "data path", "backpressure", "error propagation", "end-to-end checking", "protocol coverage"],
        tasks: [
          { id: "roadmap-week20-learn-subsystem-verification", category: "learn", title: "学习协议子系统验证策略" },
          { id: "roadmap-week20-practice-end-to-end-scenarios", category: "practice", title: "设计端到端与错误注入场景" },
          { id: "roadmap-week20-build-protocol-subsystem", category: "build", title: "搭建AXI/APB/SPI子系统验证骨架" },
        ],
        projectReferences: ["project-axi-apb-spi"],
      }),
    ],
  },
  {
    id: "stage06",
    title: "Projects + Interview",
    description: "完成综合验证项目，整理工程证据，并围绕核心知识与项目经历准备面试。",
    duration: "Week 21-24",
    skills: ["Project Planning", "Verification Closure", "Documentation", "Portfolio", "Interview"],
    weeks: [
      defineWeek({
        id: "week21",
        title: "项目规划与工程化",
        goal: "选择综合项目并建立需求、计划、仓库和可复现运行入口。",
        topics: ["project scope", "requirements", "verification plan", "repository structure", "coding convention", "run script", "README"],
        tasks: [
          { id: "roadmap-week21-learn-project-planning", category: "learn", title: "学习验证项目拆解方法" },
          { id: "roadmap-week21-practice-project-review", category: "practice", title: "评审项目范围与退出标准" },
          { id: "roadmap-week21-build-project-baseline", category: "build", title: "建立综合项目工程基线" },
        ],
        projectReferences: ["project-uart-verification", "project-fifo-verification", "project-apb-slave-verification"],
      }),
      defineWeek({
        id: "week22",
        title: "综合项目实现",
        goal: "完成协议子系统的激励、监测、检查、断言和覆盖模型。",
        topics: ["testbench integration", "virtual sequence", "scoreboard", "assertions", "coverage model", "error injection", "regression"],
        tasks: [
          { id: "roadmap-week22-learn-integration-strategy", category: "learn", title: "学习子系统验证集成策略" },
          { id: "roadmap-week22-practice-cross-protocol-tests", category: "practice", title: "实现跨协议场景与错误注入" },
          { id: "roadmap-week22-build-integrated-environment", category: "build", title: "完成AXI/APB/SPI集成验证环境" },
        ],
        projectReferences: ["project-axi-apb-spi"],
      }),
      defineWeek({
        id: "week23",
        title: "项目收敛与作品集",
        goal: "完成回归、覆盖率收敛、缺陷总结和可展示的项目文档。",
        topics: ["coverage closure", "regression report", "bug summary", "verification report", "README", "architecture diagram", "project evidence"],
        tasks: [
          { id: "roadmap-week23-learn-verification-report", category: "learn", title: "学习验证报告与项目展示结构" },
          { id: "roadmap-week23-debug-project-closure", category: "debug", title: "关闭剩余失败用例与覆盖缺口" },
          { id: "roadmap-week23-build-project-portfolio", category: "build", title: "整理项目README、报告和作品集证据" },
        ],
        projectReferences: ["project-axi-apb-spi"],
      }),
      defineWeek({
        id: "week24",
        title: "面试复习与项目表达",
        goal: "系统复习核心知识，并能够清晰说明验证方法、调试过程和项目成果。",
        topics: ["Verilog interview", "SystemVerilog interview", "UVM interview", "protocol interview", "debug story", "project presentation", "mock interview"],
        tasks: [
          { id: "roadmap-week24-learn-interview-review", category: "learn", title: "复习Verilog、SystemVerilog、UVM与协议核心问题" },
          { id: "roadmap-week24-practice-mock-interview", category: "practice", title: "完成技术与项目模拟面试" },
          { id: "roadmap-week24-build-project-presentation", category: "build", title: "准备项目介绍与问题复盘材料" },
        ],
        projectReferences: [
          "project-uart-verification",
          "project-fifo-verification",
          "project-apb-slave-verification",
          "project-axi-apb-spi",
        ],
      }),
    ],
  },
];

export const roadmap: RoadmapStage[] = learningRoadmap.map((stage, stageIndex) => ({
  id: stage.id,
  stage: stageIndex + 1,
  title: stage.title,
  items: stage.weeks.map((week) => {
    const weekNumber = Number(week.id.slice("week".length));
    return {
      id: week.id,
      weekStart: weekNumber,
      weekEnd: weekNumber,
      title: week.title,
      status: weekNumber === 1 ? "available" : "coming_later",
    };
  }),
}));
