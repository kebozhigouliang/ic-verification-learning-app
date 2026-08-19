import type { LearningWeek } from "@/types/learning";

export const week01: LearningWeek = {
  id: "week01",
  week: 1,
  title: "基础RTL",
  days: [
    {
      id: "w01d01", week: 1, day: 1, kind: "learning", title: "数字逻辑与Verilog环境入门",
      topics: ["Binary", "AND", "OR", "NOT", "XOR", "module", "input", "output", "wire", "assign"],
      learn: [
        { id: "w01d01-learn-nandland-fpga101", title: "Nandland FPGA-101相关基础内容", type: "document", scope: "数字系统基础" },
        { id: "w01d01-learn-nandland-verilog", title: "Nandland Learn Verilog基础章节", type: "document", scope: "Verilog基础" },
        { id: "w01d01-learn-hdlbits", title: "HDLBits", type: "practice", scope: "最基础练习" },
      ],
      practice: [{ id: "w01d01-practice-hdlbits-basic", title: "完成HDLBits最基础练习", quantity: 5, target: "完成约5道最基础练习" }],
      build: [{ id: "w01d01-build-gates", title: "实现最简单的逻辑门模块", requirements: ["AND", "OR", "XOR", "NOT"], requiresTestbench: false, requiresSimulation: true, requiresWaveform: false, deliverables: ["AND", "OR", "XOR", "NOT"] }],
      debug: [],
      passCriteria: [
        { id: "w01d01-pass-gates", label: "能解释AND / OR / XOR / NOT" }, { id: "w01d01-pass-module", label: "知道module是什么" },
        { id: "w01d01-pass-io", label: "知道input/output是什么" }, { id: "w01d01-pass-wire", label: "知道wire是什么" },
        { id: "w01d01-pass-assign", label: "能自己写assign" }, { id: "w01d01-pass-run", label: "可以运行第一个Verilog程序" },
      ],
    },
    {
      id: "w01d02", week: 1, day: 2, kind: "learning", title: "组合逻辑与MUX",
      topics: ["Boolean Logic", "Multiplexer", "条件运算符", "assign", "? :"], learn: [],
      practice: [{ id: "w01d02-practice-hdlbits-mux", title: "HDLBits MUX相关基础题" }],
      build: [
        { id: "w01d02-build-mux2", title: "实现2:1 MUX", requirements: ["RTL", "简单Testbench"], requiresTestbench: true, requiresSimulation: true, requiresWaveform: false, deliverables: ["2:1 MUX RTL", "简单Testbench"] },
        { id: "w01d02-build-mux4", title: "实现4:1 MUX", requirements: ["RTL", "简单Testbench"], requiresTestbench: true, requiresSimulation: true, requiresWaveform: false, deliverables: ["4:1 MUX RTL", "简单Testbench"] },
      ],
      debug: [],
      passCriteria: [
        { id: "w01d02-pass-explain", label: "能解释MUX作用" }, { id: "w01d02-pass-draw", label: "能画出2:1 MUX逻辑" },
        { id: "w01d02-pass-write", label: "不看答案写2:1 MUX" }, { id: "w01d02-pass-sim", label: "可以仿真" },
      ],
    },
    {
      id: "w01d03", week: 1, day: 3, kind: "learning", title: "Decoder / Encoder",
      topics: ["Decoder", "Encoder", "case"], learn: [], practice: [],
      build: [{ id: "w01d03-build-decoder", title: "实现2-to-4 Decoder", requirements: ["练习case", "Testbench验证所有输入组合"], requiresTestbench: true, requiresSimulation: true, requiresWaveform: false, deliverables: ["2-to-4 Decoder", "Testbench"] }],
      debug: [],
      passCriteria: [
        { id: "w01d03-pass-explain", label: "能解释Decoder" }, { id: "w01d03-pass-case", label: "可以用case写Decoder" },
        { id: "w01d03-pass-tb", label: "能写Testbench验证所有输入组合" },
      ],
    },
    {
      id: "w01d04", week: 1, day: 4, kind: "learning", title: "Adder",
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
      id: "w01d05", week: 1, day: 5, kind: "learning", title: "always组合逻辑",
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
      id: "w01d06", week: 1, day: 6, kind: "learning", title: "综合练习",
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
      id: "w01d07", week: 1, day: 7, kind: "checkpoint", title: "Week 1 Checkpoint",
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
