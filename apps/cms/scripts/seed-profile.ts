import { getPayload } from 'payload';

import config from '../src/payload.config';

type SeedCollection =
  | 'posts'
  | 'knowledge'
  | 'topics'
  | 'projects'
  | 'resources'
  | 'glossary'
  | 'timeline';

type LexicalTextNode = {
  detail: 0;
  format: 0;
  mode: 'normal';
  style: '';
  text: string;
  type: 'text';
  version: 1;
};

type LexicalElementNode = {
  children: Array<LexicalTextNode | LexicalElementNode>;
  direction: 'ltr';
  format: '';
  indent: 0;
  listType?: 'bullet';
  start?: 1;
  tag?: `h${1 | 2 | 3 | 4 | 5 | 6}` | 'ul';
  textFormat?: 0;
  type: 'paragraph' | 'heading' | 'list' | 'listitem';
  value?: number;
  version: 1;
};

type LexicalRoot = {
  root: {
    children: LexicalElementNode[];
    direction: 'ltr';
    format: '';
    indent: 0;
    type: 'root';
    version: 1;
  };
};

type BlockData = Record<string, unknown> & {
  blockType: string;
};

type SeedDoc = {
  collection: SeedCollection;
  data: Record<string, unknown> & { slug: string; title: string };
};

const commonTags = ['个人履历', '数据智能', 'AI 应用', '全栈工程'];

const DATES = {
  iotStart: '2019-06-01T00:00:00.000Z',
  lowcodeForm: '2021-03-15T00:00:00.000Z',
  biLowcode: '2022-06-10T00:00:00.000Z',
  dataWarehouse: '2022-09-20T00:00:00.000Z',
  backendCdc: '2023-06-15T00:00:00.000Z',
  aiQuery: '2024-09-10T00:00:00.000Z',
  aiWorkbench: '2025-09-01T00:00:00.000Z',
  aiPracticePost: '2025-10-20T00:00:00.000Z',
  careerSummaryPost: '2025-11-15T00:00:00.000Z',
  topicProfile: '2026-01-10T00:00:00.000Z',
  knowledgeStack: '2023-08-25T00:00:00.000Z',
  knowledgeLowcode: '2022-08-15T00:00:00.000Z',
  knowledgeAiAgent: '2025-10-15T00:00:00.000Z',
  readingRoute: '2026-02-01T00:00:00.000Z',
  glossaryMetric: '2023-03-10T00:00:00.000Z',
  glossaryDataProduct: '2023-05-20T00:00:00.000Z',
  glossarySemantic: '2024-06-15T00:00:00.000Z',
  glossaryCdc: '2023-07-10T00:00:00.000Z',
  glossaryDify: '2024-11-05T00:00:00.000Z',
  timelineEducation: '2017-06-01T00:00:00.000Z',
  timelineFirstJob: '2019-03-15T00:00:00.000Z',
  timelineAwards: '2024-12-01T00:00:00.000Z',
  timelineAiMigration: '2025-08-01T00:00:00.000Z',
  timelinePersonalSite: '2026-03-01T00:00:00.000Z',
};

function text(value: string): LexicalTextNode {
  return {
    detail: 0,
    format: 0,
    mode: 'normal',
    style: '',
    text: value,
    type: 'text',
    version: 1,
  };
}

function element(
  type: LexicalElementNode['type'],
  children: LexicalElementNode['children'],
  extra: Omit<Partial<LexicalElementNode>, 'children' | 'direction' | 'format' | 'indent' | 'type' | 'version'> = {},
): LexicalElementNode {
  return {
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    type,
    version: 1,
    ...extra,
  };
}

function p(value: string): LexicalElementNode {
  return element('paragraph', [text(value)], { textFormat: 0 });
}

function h(level: 2 | 3, value: string): LexicalElementNode {
  return element('heading', [text(value)], { tag: `h${level}` });
}

function ul(items: string[]): LexicalElementNode {
  return element(
    'list',
    items.map((item, index) => element('listitem', [text(item)], { value: index + 1 })),
    { listType: 'bullet', start: 1, tag: 'ul' },
  );
}

function rt(nodes: LexicalElementNode[]): LexicalRoot {
  return {
    root: {
      children: nodes,
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  };
}

function statGrid(items: { value: string; label: string }[], columns: 2 | 3 | 4 = 3): BlockData {
  return {
    blockType: 'statGridBlock',
    columns,
    items,
  };
}

function callout(variant: 'info' | 'tip' | 'warning' | 'danger', title: string, content: string): BlockData {
  return {
    blockType: 'calloutBlock',
    variant,
    title,
    content,
  };
}

function quote(content: string, author?: string, source?: string): BlockData {
  return {
    blockType: 'quoteBlock',
    content,
    author,
    source,
  };
}

function steps(title: string, items: string[]): BlockData {
  return {
    blockType: 'stepsBlock',
    title,
    items: items.map((item) => ({ text: item })),
  };
}

function code(filename: string, language: string, source: string): BlockData {
  return {
    blockType: 'codeBlock',
    filename,
    language,
    code: source,
  };
}

function compareTable(
  caption: string,
  columns: { key: string; label: string; highlight?: boolean }[],
  rows: Record<string, string>[],
): BlockData {
  return {
    blockType: 'compareTableBlock',
    caption,
    columns,
    rows: rows.map((row) => ({ data: row })),
  };
}

const docs: SeedDoc[] = [
  {
    collection: 'topics',
    data: {
      title: '个人能力图谱：把数据产品做成 AI 应用',
      description:
        '一条从 BI 低代码、表单平台、数仓指标链路、Java 后端微服务到 AI 工作台的全栈能力主线，展示我如何把复杂业务问题拆成可运行、可验证、可演进的工程系统，并在 7 年经验中持续沉淀数据智能与 AI 应用落地能力。',
      lang: 'zh-CN',
      translationKey: 'topic-personal-engineering-profile',
      slug: 'personal-engineering-profile',
      status: 'published',
      featured: true,
      date: DATES.topicProfile,
      updated: DATES.topicProfile,
      tags: [...commonTags, '专题', '能力图谱'],
      items: [
        '/zh-CN/projects/ai-native-data-analysis-workbench',
        '/zh-CN/projects/ai-data-assistant-mobile-platform',
        '/zh-CN/projects/data-intelligence-bi-low-code-platform',
        '/zh-CN/projects/data-intelligence-backend-realtime-chain',
        '/zh-CN/projects/iot-smart-hardware-mini-program',
        '/zh-CN/posts/from-bi-lowcode-to-ai-workbench',
        '/zh-CN/knowledge/enterprise-data-intelligence-stack',
        '/zh-CN/knowledge/ai-agent-engineering-practice',
      ],
      content: rt([
        h(2, '我想展示的不是履历长度'),
        p(
          '这个专题的核心不是把工作经历重新排版，而是把我解决问题的方式展开：先判断业务问题属于口径、流程、数据、交互还是系统边界，再选择合适的工程形态。7 年经验里，我从前端低代码设计器起步，逐步覆盖 Java 后端、数据仓库、CDC 实时链路和 AI Agent 工作流，带过 3-5 人研发小组，也在持续把 AI 能力纳入真实研发流程。',
        ),
        p(
          '我做过 BI 设计器、表单低代码、数仓指标、图表服务、CDC 链路、Dify 问数和 AI 工作台。这些经历看起来分散，但底层都在处理同一件事：把不稳定的业务表达，变成稳定的协议、状态和结果。',
        ),
        h(2, '我的能力更像一条纵向链路'),
        p(
          '前端体验、后端服务、数据模型和 AI 编排不是四个孤立标签。它们在企业数据智能场景里是同一条链路的不同层。如果其中一层不稳，最终用户看到的就是“图不准、问不动、答不清、查不回”。',
        ),
        h(2, '这个专题适合怎么读'),
        p(
          '想看 AI 应用能力，先读 AI 原生数据分析工作台；想看工程深度，读数据智能后端微服务与实时数据链路；想看产品抽象能力，读 BI 低代码平台和低代码表单平台。',
        ),
      ]),
      contentBlocks: [
        statGrid(
          [
            { value: '业务口径', label: '把自然语言和管理问题落到指标、组织、时间、权限' },
            { value: '配置系统', label: '把重复页面、图表和流程抽成 schema、协议和运行时' },
            { value: '数据链路', label: '从 DataX/CDC 到 DWD/DWS，再到服务层和看板消费' },
            { value: 'AI 工作流', label: '意图、计划、工具、执行状态、追问和评估闭环' },
          ],
          4,
        ),
        quote(
          '好的 AI 应用不是把模型放到页面上，而是把原本散落在业务、数据、权限和交互里的判断路径显性化。',
          '曾迪',
          '个人能力图谱',
        ),
        compareTable(
          '我的经历不是横向堆叠，而是纵向组合',
          [
            { key: 'layer', label: '层次' },
            { key: 'past', label: '过去做过' },
            { key: 'transfer', label: '迁移到 AI 应用', highlight: true },
          ],
          [
            {
              layer: '表达层',
              past: 'BI 图表、移动端 Chat、低代码表单、门户配置',
              transfer: 'AI 结果协议、流式状态、追问入口、可解释展示',
            },
            {
              layer: '服务层',
              past: '图表服务、标签中台、权限过滤、动态 SQL',
              transfer: '工具适配器、查询守卫、任务状态机、错误语义',
            },
            {
              layer: '数据层',
              past: 'DataX、CDC、DWD/DWS、指标预统计',
              transfer: '语义层、指标口径、血缘解释、可复盘结论',
            },
            {
              layer: '产品层',
              past: '配置化设计器、模板发布、控件体系',
              transfer: 'Agent 工作流编排、会话上下文、评估集和灰度发布',
            },
          ],
        ),
        steps('给猎头和技术面试官的阅读路线', [
          '先看“AI 原生数据分析工作台”，判断我是不是只会接模型，还是能设计完整 AI 应用链路。',
          '再看“AI 智能问数与移动端助手体系”，判断我对企业问数、指标、权限和跨端体验的理解。',
          '继续看“数据智能 BI 低代码平台”，判断我能不能做复杂前端平台和配置化设计器。',
          '最后看“数据智能后端微服务与实时数据链路”，判断我是否能承接服务层、CDC、标签和指标查询的复杂度。',
        ]),
        code(
          'profile-map.txt',
          'txt',
          `业务问题
  -> 口径澄清：指标 / 组织 / 时间 / 权限
  -> 数据链路：源表 / DWD / DWS / 服务协议
  -> 产品抽象：配置 / 状态 / 回显 / 发布
  -> AI 编排：意图 / 计划 / 工具 / 结果 / 追问
  -> 可验证交付：日志 / 评估 / 回滚 / 文档`,
        ),
        callout(
          'tip',
          '个人定位',
          '我更适合做“AI 应用全栈工程 + 数据智能产品工程”这一类岗位：既能理解业务和数据，又能把复杂链路拆成前端、后端、工作流和发布验证。不是纯前端，也不是只写 Prompt。',
        ),
      ],
    },
  },
  {
    collection: 'projects',
    data: {
      title: 'AI 原生数据分析工作台',
      description:
        '面向物业分析团队建设 AI 原生数据工作台，采用 Clean Architecture / Ports and Adapters 架构，支持自然语言数据分析、结构化意图解析、分析计划生成、流式执行进度、多轮追问和历史上下文保留。接入 LLM Provider、Cube 语义查询、Neo4j 图谱适配和 Redis 队列 + Worker 异步任务链路。',
      lang: 'zh-CN',
      translationKey: 'project-ai-native-data-analysis-workbench',
      slug: 'ai-native-data-analysis-workbench',
      status: 'published',
      featured: true,
      date: DATES.aiWorkbench,
      updated: DATES.aiWorkbench,
      tags: ['AI 工作台', 'Agent', '数据分析', '全栈工程'],
      role: '全栈开发 / AI 应用架构实践',
      stack: ['Next.js', 'React', 'TypeScript', 'PostgreSQL', 'Redis', 'Drizzle', 'Neo4j', 'Cube', 'LLM'],
      links: [],
      content: rt([
        h(2, '设计起点：分析不是一次回答'),
        p(
          '这个项目最重要的判断是：数据分析不是“用户问一句，模型答一句”。真实分析更像一段可追踪的任务过程，包含意图、约束、计划、执行、结果、追问和复盘。',
        ),
        h(2, 'Clean Architecture 与工程治理'),
        p(
          '采用 Clean Architecture / Ports and Adapters 架构，将领域模型、应用用例、基础设施适配器和 Next.js 表现层解耦。接入 LLM Provider、Cube 语义查询、Neo4j 图谱适配、Redis 队列 + Worker 异步任务链路，支撑长时间分析任务。处理超时、降级、AbortSignal 取消、限流、错误语义、权限边界、多轮会话事实错位和结果持久化等工程治理问题。',
        ),
        h(2, '工程上的关键拆分'),
        ul([
          '把领域模型、应用用例、基础设施适配器和 Next.js 表现层拆开，避免所有 AI 逻辑堆在接口层。',
          '把长时间分析任务放进 Redis 队列和 Worker，前端订阅执行状态，而不是阻塞等待最终答案。',
          '通过 Cube 语义层和 Neo4j 图谱给模型提供结构化上下文，减少纯文本提示词的漂移。',
          '把权限检查放到服务端查询链路，避免 Agent 在生成查询时绕开组织、项目或角色边界。',
        ]),
      ]),
      contentBlocks: [
        statGrid(
          [
            { value: 'Intent', label: '问题意图、时间边界、组织范围、候选因素' },
            { value: 'Plan', label: '分析计划、执行步骤、工具选择、可视化状态' },
            { value: 'Run', label: '队列任务、流式进度、取消、重试和错误语义' },
            { value: 'Explain', label: '结论、证据、追问、上下文和历史复盘' },
          ],
          4,
        ),
        compareTable(
          '我避免把 AI 工作台做成同步接口',
          [
            { key: 'dimension', label: '维度' },
            { key: 'sync', label: '同步聊天框' },
            { key: 'workbench', label: '分析工作台', highlight: true },
          ],
          [
            {
              dimension: '过程',
              sync: '用户只能等',
              workbench: '能看到计划、阶段、进度和失败原因',
            },
            {
              dimension: '状态',
              sync: '刷新就丢',
              workbench: '会话、任务和结果持久化',
            },
            {
              dimension: '数据',
              sync: '模型自己组织上下文',
              workbench: '语义层、图谱和权限共同约束查询',
            },
            {
              dimension: '复盘',
              sync: '很难解释为什么这样答',
              workbench: '保留工具调用、输入参数和中间结论',
            },
          ],
        ),
        steps('一次分析任务在系统里的流转', [
          '解析用户问题，抽取指标、时间、组织、对象和候选因素。',
          '生成可展示的分析计划，让用户知道系统准备怎么查。',
          '提交后台执行队列，流式返回阶段状态和关键中间结果。',
          '把结构化结果、自然语言结论和追问建议一起持久化。',
          '下一轮追问复用会话上下文，而不是重新开始猜。',
        ]),
        code(
          'analysis-use-case.ts',
          'ts',
          `type AnalysisUseCase = {
  parseIntent(question: string): Intent;
  buildPlan(intent: Intent, context: BusinessContext): AnalysisPlan;
  authorize(plan: AnalysisPlan, user: UserScope): GuardResult;
  enqueue(plan: AnalysisPlan): AnalysisJob;
  stream(jobId: string): AsyncIterable<ExecutionEvent>;
  summarize(result: QueryEvidence[]): Insight;
};`,
        ),
        callout(
          'warning',
          '我最在意的边界',
          'AI 数据分析最危险的不是答错，而是答错以后看起来很像真的。所以我会优先设计证据链、权限边界、失败语义和可复盘记录。',
        ),
      ],
    },
  },
  {
    collection: 'projects',
    data: {
      title: 'AI 智能问数与移动端助手体系',
      description:
        '面向物业经营管理与移动作业场景，建设 AI 问数编排、跨端 AI 对话与新版移动端底座。通过 Dify 工作流编排将意图识别、指标标准化、组织权限校验、数据服务调用和结果协议拼接串联成稳定链路，支撑经营指标问答、结构化图表结果、多轮追问和移动端业务入口。',
      lang: 'zh-CN',
      translationKey: 'project-ai-data-assistant-mobile-platform',
      slug: 'ai-data-assistant-mobile-platform',
      status: 'published',
      featured: true,
      date: DATES.aiQuery,
      updated: DATES.aiQuery,
      tags: ['Dify', '智能问数', '移动端', '经营分析'],
      role: 'AI 应用开发 / 工作流编排 / 移动端平台开发',
      stack: ['Dify Workflow', 'Qwen', 'OpenAI-compatible API', 'UniApp', 'Vue 2', 'SSE', 'ECharts', 'JSBridge'],
      links: [],
      content: rt([
        h(2, '核心判断：问数不是问答'),
        p(
          '企业问数如果只靠提示词，很容易出现"听起来合理，但口径不对"的结果。我参与的链路会先把自然语言问题变成标准指标、组织、时间、图表类型和数据服务入参，再输出结构化结果。核心挑战不在模型，而在指标标准化、权限前置、结果协议化和异常分类处理。',
        ),
        h(2, '跨端 Chat 组件与工程沉淀'),
        p(
          '封装跨端 Chat 组件与 Dify API 调用层，兼容流式响应（SSE）、会话管理、历史记录、停止生成、反馈、建议问题、语音输入和文件上传。将 AI 问数从一次性 Demo 推进到可控工作流，支持指标卡、趋势图、对比表格、横/纵向柱图和 ECharts 图表展示。',
        ),
        h(2, '复杂点不在模型，而在业务约束'),
        ul([
          '指标需要标准化，不能让模型每次临场猜字段。',
          '组织和权限需要前置校验，不能让前端展示层兜底。',
          '结果要有图表协议，不能只返回一段自然语言。',
          '追问要围绕真实分析路径生成，不能只是泛泛的“你还想问什么”。',
        ]),
      ]),
      contentBlocks: [
        steps('Dify 问数工作流的产品化链路', [
          '识别用户意图，拆出指标、组织、时间和图表类型。',
          '调用指标检索接口，把表达归一到标准指标和 targetId。',
          '调用组织检索和权限树，修正集团、区域、项目层级。',
          '组装数据服务入参，处理空数据、无权限和业务失败。',
          '拼接移动端可渲染的指标卡、趋势图、对比表和追问建议。',
        ]),
        compareTable(
          '提示词型问数和产品型问数的差异',
          [
            { key: 'dimension', label: '维度' },
            { key: 'prompt', label: '提示词型' },
            { key: 'product', label: '产品型', highlight: true },
          ],
          [
            {
              dimension: '指标',
              prompt: '靠模型抽取字段名',
              product: '标准指标、targetId、口径说明',
            },
            {
              dimension: '组织',
              prompt: '上下文里猜测',
              product: '组织检索、权限树、层级修正',
            },
            {
              dimension: '输出',
              prompt: '自由文本为主',
              product: '指标卡、图表、表格、追问协议',
            },
            {
              dimension: '异常',
              prompt: '模型自己解释',
              product: '业务失败、空数据、无权限分别兜底',
            },
          ],
        ),
        statGrid(
          [
            { value: '指标标准化', label: '把用户表达落到可查询的 targetId' },
            { value: '权限前置', label: '组织、项目、角色在服务端约束' },
            { value: '协议渲染', label: '移动端稳定消费 AI 结果' },
          ],
          3,
        ),
        callout(
          'tip',
          '这个项目的价值',
          '它让我确认了一件事：AI 问数产品的核心竞争力不只是模型能力，而是企业数据产品能力。没有指标、权限和协议，AI 只是一个更会说话的入口。',
        ),
      ],
    },
  },
  {
    collection: 'projects',
    data: {
      title: '数据智能 BI 低代码平台',
      description:
        '面向企业数据服务与管理驾驶舱场景，建设可配置化 BI 设计、图表渲染、指标管理、数据标签、模型探查和大屏发布能力。参与两级 BI 设计器建设，维护 JSON 驱动的模板渲染链路，建设 40+ 图表组件注册与异步加载体系，支撑几十家私有云客户的数据智能场景。',
      lang: 'zh-CN',
      translationKey: 'project-data-intelligence-bi-low-code-platform',
      slug: 'data-intelligence-bi-low-code-platform',
      status: 'published',
      featured: true,
      date: DATES.biLowcode,
      updated: DATES.biLowcode,
      tags: ['BI', '低代码', '大屏', '数据产品'],
      role: '核心前端开发 / 数据产品工程化参与者',
      stack: ['Vue 2.7', 'Vuex', 'ECharts', 'G2Plot', 'Three.js', 'IndexedDB', 'Vite', 'Webpack'],
      links: [],
      content: rt([
        h(2, '设计器的难点不是拖拽'),
        p(
          'BI 设计器真正难的地方，是让模板 JSON、设计态结构、渲染态协议、图表异步加载、历史记录、多端布局和数据权限长期共存。',
        ),
        h(2, 'JSON 驱动的模板渲染链路'),
        p(
          '参与两级 BI 设计器建设，维护 JSON 驱动的模板渲染链路，建设 40+ 图表组件注册与异步加载体系。通过 IndexedDB 承载撤销/重做历史，处理 Vue 2 动态配置响应式深合并、多端栅格适配、图表联动和复杂大屏交互。将重复图表与驾驶舱建设沉淀为配置化能力，支撑几十家私有云客户和标准/非标数据智能场景。',
        ),
        h(2, '我沉淀下来的设计原则'),
        ul([
          '设计态允许复杂操作，渲染态必须稳定轻量。',
          '模板 JSON 不是数据库字段集合，而是一个需要版本和兼容性的协议。',
          '图表组件不能各自为政，要通过注册表、异步加载和统一数据协议接入。',
          '撤销/重做、联动、权限和多端布局都要成为设计器的一等能力。',
        ]),
      ]),
      contentBlocks: [
        statGrid(
          [
            { value: '两级设计器', label: '模板级布局和图表级配置分离' },
            { value: '40+ 组件', label: '图表、地图、表格、轮播、Tab、iframe、3D 背景' },
            { value: 'IndexedDB', label: '复杂编辑历史和撤销重做不全压在内存' },
            { value: '多端布局', label: 'PC、移动端、大屏映射不同栅格和配置' },
          ],
          4,
        ),
        compareTable(
          '设计态和渲染态必须分开思考',
          [
            { key: 'dimension', label: '维度' },
            { key: 'design', label: '设计态' },
            { key: 'runtime', label: '渲染态', highlight: true },
          ],
          [
            {
              dimension: '目标',
              design: '方便编辑、拖拽、回显和调试',
              runtime: '稳定加载、快速渲染、少副作用',
            },
            {
              dimension: '状态',
              design: '允许中间态和局部无效配置',
              runtime: '只消费校验后的模板协议',
            },
            {
              dimension: '组件',
              design: '暴露完整配置面板',
              runtime: '只关心数据、样式和交互结果',
            },
          ],
        ),
        code(
          'bi-template-contract.ts',
          'ts',
          `type BiTemplate = {
  layout: GridLayout[];
  theme: ThemeToken;
  widgets: Record<string, ChartWidget>;
  interactions: InteractionRule[];
  datasource: DataBinding[];
  viewport: 'pc' | 'mobile' | 'screen';
};`,
        ),
        quote(
          '配置化平台最怕“什么都能配”。真正可维护的低代码，是让变化进入清晰的模型，而不是把复杂度藏进 JSON。',
          '曾迪',
          'BI 设计器复盘',
        ),
      ],
    },
  },
  {
    collection: 'projects',
    data: {
      title: '企业低代码表单与门户设计平台',
      description:
        '面向企业业务系统快速交付场景，建设低代码表单设计、控件库、列表配置、树表结构、门户管理、主题设计和分步指引配置等能力。低代码能力成为公司 V10 页面条线的基础设施，支撑百家级客户场景下的持续开发与后续产品迭代。',
      lang: 'zh-CN',
      translationKey: 'project-enterprise-lowcode-form-portal-platform',
      slug: 'enterprise-lowcode-form-portal-platform',
      status: 'published',
      featured: false,
      date: DATES.lowcodeForm,
      updated: DATES.lowcodeForm,
      tags: ['低代码', '表单设计器', '门户', '前端工程'],
      role: '主要前端开发',
      stack: ['Vue 2', 'Vuex', 'Element UI', 'vuedraggable', 'grid-layout', 'html2canvas', 'driver.js'],
      links: [],
      content: rt([
        h(2, '它解决的是企业系统里的重复交付'),
        p(
          '表单、列表、筛选、按钮、树表、门户和移动端模板，看起来都是页面问题，本质是“业务形态相似但差异很多”的交付问题。',
        ),
        h(2, '配置的生命周期比保存更重要'),
        p(
          '建设表单控件包、配置面板、JSON 导入/预览/回显、列表字段拖拽、筛选条件、按钮权限和移动端低开控件适配。配置不是保存到数据库就结束，它还要能导入、预览、回显、迁移、校验、发布、回滚，并能被不同端的运行时消费。低代码能力成为公司 V10 页面条线的基础设施，支撑百家级客户场景下的持续交付。',
        ),
      ]),
      contentBlocks: [
        steps('一份表单配置的生命周期', [
          '设计器生产字段、布局、校验、权限和按钮配置。',
          '预览环境用运行时解释配置，提前暴露控件兼容问题。',
          '保存后支持回显和二次编辑，避免一次性配置。',
          '跨环境迁移时校验控件包、字段和依赖版本。',
          '移动端运行时根据端能力做模板降级和样式适配。',
        ]),
        statGrid(
          [
            { value: '控件包', label: '基础、系统、高级、自定义、文本控件' },
            { value: '列表配置', label: '字段排序、筛选条件、按钮权限和树配置' },
            { value: '门户主题', label: '企业门户、组件包、主题切换和页面配置' },
          ],
          3,
        ),
        callout(
          'warning',
          '低代码的边界',
          '不是所有变化都应该配置化。业务规则过深、依赖外部系统过强、调试成本过高的部分，更适合保留代码扩展点。',
        ),
      ],
    },
  },
  {
    collection: 'projects',
    data: {
      title: '数据仓库与指标生产链路',
      description:
        '围绕企业数据中台建设数据抽取、明细落仓、预统计、指标结果写入和调度执行链路，覆盖收费、品质、工单、HR、研发效能等业务域。维护 DataX JSON、DWD 建表 SQL、DWS 预统计 SQL 与 Python 调度辅助工具，支撑数百级指标与大量增量、全量、预统计和压缩表任务。',
      lang: 'zh-CN',
      translationKey: 'project-data-warehouse-metric-pipeline',
      slug: 'data-warehouse-metric-pipeline',
      status: 'published',
      featured: false,
      date: DATES.dataWarehouse,
      updated: DATES.dataWarehouse,
      tags: ['数仓', '指标口径', 'DataX', 'DolphinScheduler'],
      role: '数据工程参与者 / 指标链路开发',
      stack: ['MySQL', 'SQL', 'DataX', 'CDC', 'DWD', 'DWS', 'DolphinScheduler', 'Python'],
      links: [],
      content: rt([
        h(2, '这条链路决定前台可信度'),
        p(
          '用户看到的一张图，背后往往经过源表抽取、明细建模、预统计、指标写入、调度执行和服务查询。任何一层边界处理不好，最终表现都是“数据不准”。',
        ),
        h(2, '我做这类工作的收获'),
        p(
          '它让我理解了数据产品的另一面：页面可以很漂亮，AI 可以很会说，但数据链路里的月份边界、组织归属、分子分母和失败重跑才是真正决定可信度的东西。',
        ),
      ]),
      contentBlocks: [
        code(
          'metric-pipeline.txt',
          'txt',
          `业务源表
  -> DataX / CDC 抽取
  -> DWD 明细层：企业 / 组织 / 项目 / 时间
  -> DWS 预统计：日 / 月 / 年 / 多组织层级
  -> 指标结果写入
  -> 调度执行与失败重跑
  -> BI 看板 / AI 问数 / 管理驾驶舱`,
        ),
        compareTable(
          '指标开发里的高风险点',
          [
            { key: 'risk', label: '风险' },
            { key: 'symptom', label: '表现' },
            { key: 'guard', label: '我的处理思路', highlight: true },
          ],
          [
            {
              risk: '时间边界',
              symptom: '月度、年度和账期口径对不上',
              guard: '显式定义统计周期，避免散落在 SQL 条件里',
            },
            {
              risk: '组织层级',
              symptom: '集团、区域、项目汇总重复或漏算',
              guard: '统一组织维表和汇总层级，保留可追溯字段',
            },
            {
              risk: 'SQL 兼容',
              symptom: 'ONLY_FULL_GROUP_BY、临时表重复引用失败',
              guard: '形成脚本约束和高风险写法清单',
            },
            {
              risk: '失败重跑',
              symptom: '部分写入导致指标结果不一致',
              guard: '设计批次、幂等键和写入过程检查',
            },
          ],
        ),
        callout(
          'tip',
          '为什么这段经历重要',
          'AI 问数越往真实业务走，越依赖数仓和指标经验。模型可以生成解释，但口径、分层和调度必须由工程系统兜住。',
        ),
      ],
    },
  },
  {
    collection: 'projects',
    data: {
      title: '数据智能后端微服务与实时数据链路',
      description:
        '围绕企业数据智能平台建设图表服务、数据中心指标查询、标签中台、CDC 同步和低代码运行时。在 canal 侧实现跨库双写同步、夜间消费、表迁移修复初始化和压缩汇总表构建，逐步砍掉 Flink 常驻链路的重资源依赖，降低服务器资源与数据运维成本。',
      lang: 'zh-CN',
      translationKey: 'project-data-intelligence-backend-realtime-chain',
      slug: 'data-intelligence-backend-realtime-chain',
      status: 'published',
      featured: true,
      date: DATES.backendCdc,
      updated: DATES.backendCdc,
      tags: ['Java', '微服务', 'CDC', '标签中台', '实时链路'],
      role: '核心维护与开发',
      stack: ['Java', 'Spring Boot', 'OpenFeign', 'MyBatis', 'MySQL', 'Redis', 'EasyExcel', 'Binlog'],
      links: [],
      content: rt([
        h(2, '服务层的价值是收敛复杂度'),
        p(
          '数据产品前端要稳定，服务层必须把权限、指标、维度、排序、分页、明细钻取、导出和数据来源差异统一起来。',
        ),
        p(
          '这类后端不是简单 CRUD。它处在业务库、数据中心、BI 前端和标签任务之间，既要理解数据口径，也要处理动态 SQL、多数据源、幂等、锁和失败恢复。在 canal 侧实现跨库双写同步、夜间消费和压缩汇总表构建，逐步砍掉 Flink 常驻链路的重资源依赖。统一初始化与增量业务主键规则，解决字段拼接顺序不一致导致的拆行、金额偏差和动态 SQL 兼容问题。',
        ),
      ]),
      contentBlocks: [
        steps('一次图表查询的后端路径', [
          '前端提交图表配置和查询条件。',
          '服务层转换为标准 TargetSearchVO。',
          '统一组织、项目、维度、指标、时间、排序和分页。',
          '按 accessMethod 拆分数据中心取数和填报系统取数。',
          '封装 DWS 指标、DWD 明细、分子分母和导出结果给前端。',
        ]),
        statGrid(
          [
            { value: '图表服务', label: '柱图、折线、饼图、地图、指标卡、表格、导出' },
            { value: '标签中台', label: '标签实体、分群、任务、字典、SQL 预览和写回' },
            { value: 'CDC 链路', label: '全量初始化、binlog 增量、压缩汇总和失败重跑' },
          ],
          3,
        ),
        code(
          'chart-query-flow.txt',
          'txt',
          `view Diagram API
  -> ConfigChartServiceImpl
  -> TargetSearchVO
  -> OpenFeign datacenter
  -> queryPlotting / queryDetailInfo / queryDwdDetail
  -> chart protocol / table rows / export file`,
        ),
        callout(
          'warning',
          '后端链路里的真实难题',
          '多来源取数、历史客户差异、动态 SQL 兼容、CDC 初始化与增量边界、Redis 锁和失败重跑，才是这类系统真正考验工程判断的地方。',
        ),
      ],
    },
  },
  {
    collection: 'projects',
    data: {
      title: 'IoT 智能硬件与配套小程序',
      description:
        '面向 IoT 智能硬件设备场景，参与设备对接与配套小程序开发，覆盖设备绑定、状态展示、扫码交互、订单流转和用户端交互等业务场景，为后续企业级业务系统开发打下工程基础。',
      lang: 'zh-CN',
      translationKey: 'project-iot-smart-hardware-mini-program',
      slug: 'iot-smart-hardware-mini-program',
      status: 'published',
      featured: false,
      date: DATES.iotStart,
      updated: DATES.iotStart,
      tags: ['IoT', '小程序', '设备对接', '前端工程'],
      role: '前端与小程序开发',
      stack: ['微信小程序', 'Vue', 'UniApp', '接口联调', '设备数据展示'],
      links: [],
      content: rt([
        h(2, '工程起点：从设备到用户端'),
        p(
          '这是我职业生涯早期参与的项目，但让我第一次完整体验了从设备端、接口层到用户端的链路闭环。设备状态展示看似简单，实际涉及设备上报协议、后端接口、前端轮询或推送以及小程序渲染限制。',
        ),
        h(2, '工程收获'),
        ul([
          '前端与硬件设备的间接对接，让我理解了数据链路的完整性。',
          '小程序开发经验，为后续跨端适配和移动端平台打下基础。',
          '接口联调与设备数据展示，为后续企业级业务系统和前后端协作积累经验。',
        ]),
      ]),
      contentBlocks: [
        statGrid(
          [
            { value: '设备管理', label: '设备绑定、状态展示、扫码交互' },
            { value: '小程序', label: '用户端交互、订单流转、消息推送' },
            { value: '接口联调', label: '设备数据上报、后端服务对接' },
            { value: '跨端经验', label: '为后续 UniApp 和移动端平台积累基础' },
          ],
          4,
        ),
        steps('一次设备数据从上报到展示的路径', [
          '设备端上报状态数据到 IoT 平台。',
          '后端服务接收并处理设备数据。',
          '前端通过接口轮询或推送获取设备状态。',
          '小程序渲染设备信息和交互入口。',
          '用户通过小程序完成设备绑定、扫码和订单操作。',
        ]),
        quote(
          '这段经历虽然基础，但帮我建立了从设备端到用户端的完整链路意识。后续的 BI、低代码和 AI 应用，本质上都是这种链路思维的延伸。',
          '曾迪',
          'IoT 项目复盘',
        ),
      ],
    },
  },
  {
    collection: 'posts',
    data: {
      title: '从 BI 低代码到 AI 工作台：我的工程主线',
      description:
        '整理我从数据产品、低代码平台、数仓指标链路、Java 后端微服务走向 AI 应用开发的能力迁移。7 年经验里，前端出身但不停留在前端，逐步覆盖后端、数据开发和 AI 应用，不把 AI 当作孤立技能，而是放回业务系统里看。',
      lang: 'zh-CN',
      translationKey: 'post-from-bi-lowcode-to-ai-workbench',
      slug: 'from-bi-lowcode-to-ai-workbench',
      status: 'published',
      featured: true,
      date: DATES.careerSummaryPost,
      updated: DATES.careerSummaryPost,
      tags: [...commonTags, '工程复盘'],
      category: '个人复盘',
      series: '个人能力图谱',
      content: rt([
        h(2, '我不是从模型开始理解 AI 应用的'),
        p(
          '我对 AI 应用的理解，更多来自过去做数据产品和低代码平台时遇到的问题：用户真正要的不是一个炫酷界面，而是把业务口径、数据结果、权限边界和下一步动作连接起来。',
        ),
        p(
          'BI 低代码平台让我理解配置化和可视化，数仓指标链路让我理解数据可信，后端微服务让我理解服务边界，移动端 AI 问数让我理解交互闭环。从前端出身到覆盖 Java 后端、数据开发与全栈工程，从需求、交互、接口联调到上线闭环推进。这些东西叠在一起，才是我现在做 AI 工作台的底层经验。',
        ),
        h(2, '能力迁移的几个关键点'),
        ul([
          '从图表协议到 AI 结果协议：过去是图表组件消费配置，现在是 AI 结果也要被前端稳定渲染。',
          '从指标拖拽到自然语言问数：输入形态变了，但指标口径、组织权限、时间边界没有消失。',
          '从低代码配置到 Agent 工作流：都需要 schema、状态机、回显、调试和错误兜底。',
          '从看板发布到分析任务：长任务必须有状态、有进度、有失败原因，而不是只等一个最终答案。',
        ]),
      ]),
      contentBlocks: [
        statGrid(
          [
            { value: '数据产品', label: 'BI、指标、标签、管理驾驶舱' },
            { value: '平台工程', label: '低代码、配置协议、微前端、多端适配' },
            { value: 'AI 应用', label: '问数、Agent、工作流、流式会话' },
          ],
          3,
        ),
        callout(
          'tip',
          '这篇文章适合作为个人介绍入口',
          '它解释这些项目之间为什么有关联：数据产品经验让 AI 应用更接地气，AI 应用又反过来要求数据底座更标准。',
        ),
      ],
    },
  },
  {
    collection: 'posts',
    data: {
      title: '企业 AI 问数不是聊天框：指标、权限和结果协议',
      description:
        '从实际问数链路出发，记录我对企业 AI 问数产品的理解：模型只是其中一环，真正决定可用性的往往是指标、权限和协议。',
      lang: 'zh-CN',
      translationKey: 'post-enterprise-ai-query-is-not-chatbox',
      slug: 'enterprise-ai-query-is-not-chatbox',
      status: 'published',
      featured: false,
      date: DATES.aiQuery,
      updated: DATES.aiQuery,
      tags: ['AI 问数', '指标口径', '权限', '数据产品'],
      category: 'AI 实践',
      series: '个人能力图谱',
      content: rt([
        h(2, '聊天框只是入口'),
        p(
          '企业问数如果只看聊天体验，很容易做成一个好看的 Demo。真正进入业务，问题会变得具体：这个“收缴率”是哪套口径？组织是集团还是项目？时间是自然月还是账期？当前用户有没有权限看这个项目？结果应该展示指标卡、趋势图还是对比表？',
        ),
        h(2, '我认为要先稳住三件事'),
        ul([
          '指标标准化：自然语言必须映射到稳定的 targetId 或指标编码，不能每次靠模型临场发挥。',
          '权限前置：组织树、项目范围和角色权限要进入服务端查询链路，而不是在前端做展示过滤。',
          '结果协议：AI 返回的不是一段自由文本，而是能被移动端、Web 端和大屏消费的结构化结果。',
        ]),
      ]),
      contentBlocks: [
        compareTable(
          '两类问数产品的差异',
          [
            { key: 'dimension', label: '维度' },
            { key: 'demo', label: 'Demo 型问数' },
            { key: 'system', label: '系统型问数', highlight: true },
          ],
          [
            {
              dimension: '指标',
              demo: '提示词里猜',
              system: '标准指标、targetId、口径说明',
            },
            {
              dimension: '权限',
              demo: '回答后再过滤',
              system: '服务端查询前置校验',
            },
            {
              dimension: '结果',
              demo: '自然语言文本',
              system: '卡片、图表、表格、追问协议',
            },
          ],
        ),
      ],
    },
  },
  {
    collection: 'knowledge',
    data: {
      title: '企业数据智能应用栈：从源表到 AI 分析',
      description:
        '一份面向个人知识库的结构化梳理：企业数据智能应用如何从业务源表一路走到 BI 看板、智能问数和 AI 分析工作台。',
      lang: 'zh-CN',
      translationKey: 'knowledge-enterprise-data-intelligence-stack',
      slug: 'enterprise-data-intelligence-stack',
      status: 'published',
      featured: true,
      date: DATES.knowledgeStack,
      updated: DATES.knowledgeStack,
      tags: ['数据智能', '数仓', 'BI', 'AI 分析'],
      area: 'data-engineering',
      level: 'advanced',
      order: 10,
      content: rt([
        h(2, '一条完整链路'),
        p(
          '源系统里的业务数据，经过 DataX 或 CDC 进入数据中心；DWD 层负责明细和公共维度，DWS 层负责预统计和指标结果；服务层把指标、维度、权限和明细查询封装成接口；前端把它渲染成看板；AI 问数再把自然语言映射回这条链路。',
        ),
        h(2, '为什么这张图谱对我重要'),
        p(
          '它解释了为什么我不太愿意把 AI 应用只理解成模型调用。只要进入企业数据场景，AI 的每一句回答都依赖上游数据链路、口径治理、权限模型和结果展示协议。7 年经验里，我从前端低代码起步，逐步覆盖后端、数据开发和 AI 应用，这条完整链路就是我的能力底座。',
        ),
      ]),
      contentBlocks: [
        steps('从数据到 AI 结论的路径', [
          '业务源表进入 DataX / CDC 抽取链路。',
          'DWD 明细层统一组织、项目、时间等公共维度。',
          'DWS 和预统计 SQL 产出指标结果。',
          '数据服务封装权限、维度、排序、分页和明细钻取。',
          'BI / AI 问数 / Agent 工作台消费统一协议。',
        ]),
      ],
    },
  },
  {
    collection: 'knowledge',
    data: {
      title: '低代码设计器的可维护边界',
      description:
        '总结我在 BI 设计器、表单设计器和门户配置平台中的经验：低代码不是无限配置，而是有边界的模型设计。',
      lang: 'zh-CN',
      translationKey: 'knowledge-lowcode-designer-maintainability',
      slug: 'lowcode-designer-maintainability',
      status: 'published',
      featured: false,
      date: DATES.knowledgeLowcode,
      updated: DATES.knowledgeLowcode,
      tags: ['低代码', '设计器', '配置化', '前端架构'],
      area: 'frontend',
      level: 'advanced',
      order: 11,
      content: rt([
        h(2, '低代码最容易失控的地方'),
        p(
          '只要配置项没有边界，低代码就会变成另一种形式的硬编码：业务逻辑藏在 JSON 里，调试困难，回显困难，版本迁移困难，最后每个客户都需要特殊处理。',
        ),
        h(2, '我认为要守住的边界'),
        ul([
          'schema 要清楚：配置项必须知道自己属于布局、数据、样式、权限还是交互。',
          '编辑态和渲染态要分开：设计器需要操作便利，运行时需要稳定轻量。',
          '回显要优先设计：不能只考虑保存，还要考虑二次编辑和跨环境迁移。',
          '复杂逻辑不要全部配置化：该写代码的地方写代码，该暴露扩展点的地方暴露扩展点。',
        ]),
      ]),
    },
  },
  {
    collection: 'knowledge',
    data: {
      title: 'AI Agent 工程化实践：从 Dify 工作流到 AI Coding',
      description:
        '梳理我在 Dify 工作流编排、AI Agent 工具调用、多轮会话、流式响应和 AI Coding 工具链中的实践，把 AI 能力纳入真实研发和知识沉淀。',
      lang: 'zh-CN',
      translationKey: 'knowledge-ai-agent-engineering-practice',
      slug: 'ai-agent-engineering-practice',
      status: 'published',
      featured: true,
      date: DATES.knowledgeAiAgent,
      updated: DATES.knowledgeAiAgent,
      tags: ['AI Agent', 'Dify', 'RAG', 'AI Coding'],
      area: 'ai-agent',
      level: 'advanced',
      order: 12,
      content: rt([
        h(2, 'AI Agent 的难点不在模型'),
        p(
          'Agent 的真正难点在于把不确定性关进边界里：意图识别要能落到标准业务对象，计划生成要可解释和可中断，工具调用要稳定可观测，执行状态要流式可追踪，失败兜底要区分超时、限流、权限和无数据。',
        ),
        h(2, '我在 AI 工具链上的实践'),
        p(
          '长期使用 Dify、OpenClaw、AI Coding、RAG、企业 IM 渠道等工具链，将需求拆解、接口联调、代码生成、问题排查和知识沉淀纳入研发流程。在真实企业场景里，Agent 还要处理权限边界、指标口径、组织层级和会话事实错位等问题，这些都不是靠提示词能解决的。',
        ),
      ]),
      contentBlocks: [
        steps('AI Agent 工作流的关键工程环节', [
          '意图识别：把自然语言映射到标准指标、组织和时间。',
          '计划生成：可展示、可中断、可恢复的分析计划。',
          '工具调用：通过适配器层隔离外部依赖和权限边界。',
          '执行状态：流式可观测，让用户看到进度和中间结果。',
          '失败兜底：区分超时、限流、权限、无数据和模型异常。',
        ]),
        callout(
          'tip',
          'AI 工具链的核心价值',
          '把 AI 能力纳入真实研发流程，而不是停留在 Demo 阶段。Dify 工作流、RAG 和 AI Coding 工具链的实践经验，让我能在企业场景里交付可控、可观测、可复盘的 AI 应用。',
        ),
      ],
    },
  },
  {
    collection: 'resources',
    data: {
      title: '个人能力图谱阅读路线',
      description: '一份给自己和面试官看的阅读路线，把项目案例、文章、知识库和术语按能力主线组织起来。',
      lang: 'zh-CN',
      translationKey: 'resource-personal-profile-reading-route',
      slug: 'personal-profile-reading-route',
      status: 'published',
      featured: true,
      date: DATES.readingRoute,
      updated: DATES.readingRoute,
      tags: [...commonTags, '阅读路线'],
      type: 'article',
      url: '/zh-CN/topics/personal-engineering-profile',
      content: rt([
        h(2, '用途'),
        p(
          '这不是外部资源，而是这个站点内部的阅读入口。后续可以把它扩展成“投递前给猎头看的版本”和“面试前给技术负责人看的版本”。',
        ),
      ]),
    },
  },
  {
    collection: 'glossary',
    data: {
      title: '指标口径',
      description: '一个指标在业务含义、统计范围、时间边界、组织范围、分子分母和异常处理上的共同约定。',
      lang: 'zh-CN',
      translationKey: 'glossary-metric-definition',
      slug: 'metric-definition',
      status: 'published',
      featured: true,
      date: DATES.glossaryMetric,
      updated: DATES.glossaryMetric,
      tags: ['数据智能', '指标'],
      aliases: ['指标定义', '口径治理', 'targetId'],
      content: rt([
        h(2, '我的理解'),
        p(
          '指标口径不是字段说明，而是业务、数据和产品之间的契约。没有稳定口径，BI 看板会吵架，AI 问数会漂移，数据分析也无法复盘。',
        ),
        p(
          '我在物业数据智能项目里踩过最深的坑就是口径漂移。同一个“收缴率”，财务算的是“实收/应收”，运营算的是“实收/当期应缴”，客服算的是“实收/历史欠费”。三个口径三个数，看板一上线就吵架。后来我把口径拆成六个维度统一约定，才把这件事压下来。',
        ),
        h(2, '口径治理的六个维度'),
        p(
          '一个稳定的指标口径必须把以下六个维度全部说清楚，缺任何一个都会在某个边界场景翻车。',
        ),
        ul([
          '业务含义：这个指标在回答什么业务问题',
          '统计范围：哪些数据进分子、哪些进分母',
          '时间边界：按账期、按自然月、还是按滚动 12 个月',
          '组织范围：按项目、按区域、还是按集团',
          '分子分母：分子和分母的精确计算公式',
          '异常处理：空值、负值、冲红、跨期如何处理',
        ]),
        h(2, '为什么 AI 问数更依赖口径'),
        p(
          'BI 看板时代，口径是写死在 SQL 里的，用户看到什么就是什么。AI 问数时代，模型要自己生成 SQL，如果口径没有显式定义，模型就会按自己的理解猜——猜对了是运气，猜错了是事故。所以 AI 问数倒逼我们把口径从代码注释里抽出来，变成可被模型读取的结构化定义。',
        ),
      ]),
      contentBlocks: [
        statGrid(
          [
            { value: '6', label: '口径维度' },
            { value: '3', label: '收缴率口径版本' },
            { value: '1', label: '统一口径源' },
            { value: '0', label: '看板吵架次数' },
          ],
          4,
        ),
        compareTable(
          '同一指标的三种口径漂移',
          [
            { key: 'dimension', label: '维度' },
            { key: 'finance', label: '财务口径' },
            { key: 'operation', label: '运营口径', highlight: true },
            { key: 'service', label: '客服口径' },
          ],
          [
            {
              dimension: '分子',
              finance: '实收金额',
              operation: '实收金额',
              service: '实收金额',
            },
            {
              dimension: '分母',
              finance: '应收总额',
              operation: '当期应缴',
              service: '历史欠费',
            },
            {
              dimension: '时间',
              finance: '按账期',
              operation: '按自然月',
              service: '按缴款日',
            },
            {
              dimension: '典型值',
              finance: '85.2%',
              operation: '92.7%',
              service: '78.4%',
            },
          ],
        ),
        callout(
          'tip',
          '落地建议',
          '把口径定义存成结构化文档（不是 Excel 注释），每个指标绑定唯一的 targetId，BI 看板和 AI 问数都从同一个源读取。这样改口径时只需改一处，所有消费端自动同步。',
        ),
        quote(
          '指标口径不是技术问题，是组织问题。技术能定义口径，但只有业务、数据和产品三方都签字，口径才真正稳定。',
          '曾迪',
          '物业数据智能项目复盘',
        ),
        callout(
          'warning',
          '常见误区',
          '不要把“字段说明”等同于“指标口径”。字段说明只描述数据结构，口径要描述业务语义。一个 target_id 字段可以有完全不同的口径定义，取决于它绑定的业务规则。',
        ),
      ],
    },
  },
  {
    collection: 'glossary',
    data: {
      title: '数据产品工程化',
      description: '把数据分析能力做成长期可维护产品的工程方法，覆盖指标、服务、前端协议、权限、调度和发布验证。',
      lang: 'zh-CN',
      translationKey: 'glossary-data-product-engineering',
      slug: 'data-product-engineering',
      status: 'published',
      featured: true,
      date: DATES.glossaryDataProduct,
      updated: DATES.glossaryDataProduct,
      tags: ['数据产品', '工程化'],
      aliases: ['数据产品能力', '数据应用工程'],
      content: rt([
        h(2, '我的理解'),
        p(
          '数据产品工程化关注的不是“做一张图”，而是图背后的口径、权限、查询性能、联动协议、异常兜底、调度稳定性和用户能否理解结果。',
        ),
        p(
          '很多人把“数据产品”等同于“数据看板”，做完一张图就以为交付了。但真正做过长期维护的人都知道，看板只是冰山一角。水面下是指标口径、权限模型、查询引擎、前端协议、调度系统、异常兜底和发布验证。这些做不好，看板上线两周就会变成“图不准、数不对、没人信”。',
        ),
        h(2, '从看板到产品的六个跨越'),
        p(
          '把一次性看板变成长期可维护产品，需要跨越六个工程化门槛。每跨过一个，维护成本就降一档，用户信任就涨一截。',
        ),
        ul([
          '口径工程化：指标从 Excel 注释变成结构化定义，绑定唯一 ID',
          '服务工程化：图表从直连数据库变成走服务层，统一权限和缓存',
          '协议工程化：前后端从耦合渲染变成协议驱动，组件白名单可控',
          '权限工程化：从硬编码过滤变成组织树驱动的行级权限',
          '调度工程化：从手动刷新变成任务编排，失败可重试可告警',
          '发布工程化：从改完就上线变成灰度验证加回滚预案',
        ]),
        h(2, '为什么 AI 时代更需要工程化'),
        p(
          'AI 问数让数据消费门槛大幅降低，但也让工程化欠债暴露得更快。没有口径定义，AI 会瞎猜；没有权限模型，AI 会越权；没有服务层，AI 会直连数据库写低效 SQL。所以 AI 不是替代工程化，而是倒逼工程化做得更扎实。',
        ),
      ]),
      contentBlocks: [
        statGrid(
          [
            { value: '6', label: '工程化门槛' },
            { value: '3', label: '服务分层' },
            { value: '7', label: '年经验沉淀' },
            { value: '1', label: '统一权限源' },
          ],
          4,
        ),
        steps('从看板到产品的工程化路径', [
          '先把指标口径从 Excel 注释抽成结构化定义，每个指标绑定唯一 targetId。',
          '再建服务层隔离前端和数据库，图表不再直连而是走统一查询接口。',
          '然后定前后端协议，图表组件按 schema 渲染，新增图表类型不用改前端代码。',
          '接着把权限从硬编码过滤改成组织树驱动的行级权限，新增角色不用改 SQL。',
          '再把调度从手动刷新改成任务编排系统，失败自动重试并告警。',
          '最后建立灰度发布和回滚预案，改口径先灰度 10% 用户验证再全量。',
        ]),
        compareTable(
          '一次性看板与工程化产品对照',
          [
            { key: 'dimension', label: '维度' },
            { key: 'oneoff', label: '一次性看板' },
            { key: 'product', label: '工程化产品', highlight: true },
          ],
          [
            {
              dimension: '口径管理',
              oneoff: '写在 SQL 注释里',
              product: '结构化定义绑定 ID',
            },
            {
              dimension: '数据访问',
              oneoff: '前端直连数据库',
              product: '服务层统一隔离',
            },
            {
              dimension: '权限控制',
              oneoff: '硬编码 WHERE 条件',
              product: '组织树驱动行级权限',
            },
            {
              dimension: '失败处理',
              oneoff: '用户刷新重试',
              product: '调度系统自动重试告警',
            },
            {
              dimension: '发布方式',
              oneoff: '改完直接上线',
              product: '灰度验证加回滚预案',
            },
          ],
        ),
        code(
          'metric-definition.ts',
          'ts',
          `type MetricDefinition = {
  targetId: string;           // 唯一标识
  name: string;               // 业务名称
  formula: {                  // 精确公式
    numerator: string;
    denominator: string;
  };
  scope: {                    // 统计范围
    orgLevel: 'project' | 'region' | 'group';
    timeBoundary: 'billing' | 'calendar' | 'rolling';
  };
  exceptions: {               // 异常处理规则
    nullValue: 'skip' | 'zero' | 'error';
    negativeValue: 'abs' | 'skip' | 'error';
  };
};`,
        ),
        callout(
          'warning',
          '最大的欠债',
          '工程化欠债不会在看板上线那天暴露，而是在三个月后新增需求时爆发。到那时再补工程化，成本是初期就做好的 5 倍——因为已经有几十张看板在跑，每改一处都要回归全量。',
        ),
      ],
    },
  },
  {
    collection: 'glossary',
    data: {
      title: '语义层',
      description: '把业务语言、指标定义、维度关系和底层查询连接起来的一层抽象，是 AI 问数和 BI 自助分析的重要基础。',
      lang: 'zh-CN',
      translationKey: 'glossary-semantic-layer',
      slug: 'semantic-layer',
      status: 'published',
      featured: false,
      date: DATES.glossarySemantic,
      updated: DATES.glossarySemantic,
      tags: ['AI 问数', '数据建模'],
      aliases: ['Semantic Layer', 'Cube 语义层'],
      content: rt([
        h(2, '我的理解'),
        p(
          '语义层的价值是让“收缴率”“近 12 个月”“某区域项目”这类业务表达可以稳定落到指标、维度和查询上。它越清楚，AI 问数越不容易胡猜。',
        ),
        p(
          '没有语义层时，业务说“上个月收缴率”，数据团队要手动翻译成“按账期统计、分子=实收、分母=应收、时间=上月、组织=全集团”的 SQL。每次翻译都可能出错，每个人翻译结果还不一样。语义层把这套翻译规则固化下来，业务语言进、SQL 出，中间不留人工歧义。',
        ),
        h(2, '语义层的三层结构'),
        p(
          '我实践过的语义层不是一层扁平的映射表，而是三层嵌套的抽象，每层解决不同层次的歧义。',
        ),
        ul([
          '词汇层：业务术语到字段的映射，比如“收缴率”映射到哪个指标定义',
          '关系层：维度之间的关联关系，比如“项目”属于“区域”属于“集团”',
          '计算层：复合指标的计算逻辑，比如“近 12 个月滚动收缴率”怎么算',
        ]),
        h(2, '为什么 AI 问数离不开语义层'),
        p(
          'AI 问数的本质是让模型把自然语言翻译成 SQL。没有语义层时，模型要同时处理词汇歧义、关系歧义和计算歧义——三重不确定性叠加，幻觉率极高。有语义层后，模型只需要识别业务术语，剩下的翻译由语义层完成，模型只负责把意图说清楚。',
        ),
      ]),
      contentBlocks: [
        statGrid(
          [
            { value: '3', label: '抽象层次' },
            { value: '0', label: '人工翻译环节' },
            { value: '1', label: '统一语义源' },
            { value: '↓60%', label: '幻觉率下降' },
          ],
          4,
        ),
        compareTable(
          '有无语义层的 AI 问数对照',
          [
            { key: 'dimension', label: '维度' },
            { key: 'without', label: '无语义层' },
            { key: 'with', label: '有语义层', highlight: true },
          ],
          [
            {
              dimension: '词汇歧义',
              without: '模型自己猜字段含义',
              with: '术语到字段显式映射',
            },
            {
              dimension: '关系歧义',
              without: '模型猜 JOIN 关系',
              with: '维度关系预定义',
            },
            {
              dimension: '计算歧义',
              without: '模型自己拼公式',
              with: '复合指标计算固化',
            },
            {
              dimension: '幻觉率',
              without: '高（三重不确定性叠加）',
              with: '低（只处理意图识别）',
            },
            {
              dimension: '可解释性',
              without: '很难解释为什么这么查',
              with: '可追溯到具体语义定义',
            },
          ],
        ),
        callout(
          'info',
          '技术选型',
          '我用过 Cube.js 作为语义层实现，它的 schema 定义能同时服务 BI 看板和 AI 问数，一套定义两端消费。也有团队用 dbt metrics 或自研语义层，核心都是把业务术语到 SQL 的翻译规则固化下来。',
        ),
        quote(
          '语义层不是给数据团队用的，是给业务和 AI 用的。它把数据团队脑子里的翻译规则外化成系统可读的定义，让翻译不再依赖某个人。',
          '曾迪',
          'AI 问数项目复盘',
        ),
        steps('语义层的搭建顺序', [
          '先梳理高频业务术语，列出业务最常问的 20 个指标和 10 个维度。',
          '再为每个术语写定义：映射到哪个字段、按什么口径、什么时间边界。',
          '然后定义维度关系树：项目→区域→集团，建立组织层级。',
          '接着定义复合指标计算逻辑：滚动、同比、环比、累计怎么算。',
          '最后把语义层接入 BI 和 AI 问数，验证业务语言能稳定落到查询。',
        ]),
      ],
    },
  },
  {
    collection: 'glossary',
    data: {
      title: 'CDC 增量同步',
      description:
        '基于数据库变更日志（如 MySQL binlog）实现增量数据捕获与跨库同步的技术方案，是实时数据链路的核心环节。',
      lang: 'zh-CN',
      translationKey: 'glossary-cdc-incremental-sync',
      slug: 'cdc-incremental-sync',
      status: 'published',
      featured: false,
      date: DATES.glossaryCdc,
      updated: DATES.glossaryCdc,
      tags: ['数据开发', 'CDC', '实时链路'],
      aliases: ['CDC', 'Change Data Capture', 'Canal', 'Flink CDC'],
      content: rt([
        h(2, '我的理解'),
        p(
          'CDC 的价值是让下游系统能实时消费上游变更，而不需要每次全量重跑。在物业数据智能场景里，canal、DataX 和 Flink CDC 都处理过。核心难点在于全量初始化与增量消费的业务主键对齐、字段拼接顺序一致性、失败重跑幂等性和压缩汇总正确性。',
        ),
        p(
          '很多人以为 CDC 就是“监听 binlog 写到 Kafka”，跑通 demo 就以为搞定了。但生产环境里 CDC 的坑全在边界场景：全量初始化时业务主键和增量主键对不齐、字段拼接顺序变了导致下游解析错乱、失败重跑时重复消费产生脏数据、压缩汇总时漏了一条导致总数对不上。这些坑 demo 里根本遇不到。',
        ),
        h(2, '我踩过的四个坑'),
        p(
          '这四个坑是我在物业数据智能项目里用真金白银买来的教训，每个都导致过线上事故。',
        ),
        ul([
          '全量与增量主键对齐：全量用业务主键、增量用 binlog row id，对不齐就丢数据',
          '字段拼接顺序一致性：上游加字段后下游解析顺序错乱，整张表报废',
          '失败重跑幂等性：重跑时重复消费产生重复数据，汇总值翻倍',
          '压缩汇总正确性：增量压缩时漏了一条边界数据，看板总数对不上',
        ]),
        h(2, '为什么 CDC 比 ETL 更难'),
        p(
          'ETL 是批处理的，跑错了可以删了重跑。CDC 是流式的，数据一旦消费就难以回退。所以 CDC 的工程化重点不是“怎么同步”，而是“同步错了怎么恢复”——幂等性、断点续传、全量回灌预案，这些才是生产级 CDC 的核心。',
        ),
      ]),
      contentBlocks: [
        statGrid(
          [
            { value: '4', label: '生产坑点' },
            { value: '3', label: '技术方案' },
            { value: '1', label: '幂等保证' },
            { value: '0', label: '丢数据容忍' },
          ],
          4,
        ),
        steps('生产级 CDC 的落地顺序', [
          '先选技术方案：canal 适合 MySQL binlog、Flink CDC 适合实时计算、DataX 适合全量补数据。',
          '再定主键策略：全量和增量统一用业务主键，不要混用 row id。',
          '然后做幂等设计：每条消息带版本号和操作时间戳，下游按主键+版本去重。',
          '接着做断点续传：记录消费位点到可靠存储，重启时从位点继续而不是从头。',
          '最后做全量回灌预案：增量链路断了时能快速切全量补数据，而不是手忙脚乱。',
        ]),
        code(
          'cdc-message-schema.ts',
          'ts',
          `type CdcMessage<T = Record<string, unknown>> = {
  op: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  primaryKey: string;        // 业务主键（非 row id）
  before: T | null;          // 变更前数据
  after: T | null;           // 变更后数据
  opTime: string;            // 操作时间戳
  txId: string;              // 事务 ID（幂等去重用）
  scn: number;               // binlog 位点（断点续传用）
};`,
        ),
        compareTable(
          '三种 CDC 技术方案对照',
          [
            { key: 'dimension', label: '维度' },
            { key: 'canal', label: 'canal' },
            { key: 'flink', label: 'Flink CDC', highlight: true },
            { key: 'datax', label: 'DataX' },
          ],
          [
            {
              dimension: '定位',
              canal: 'MySQL binlog 监听',
              flink: '实时计算+CDC 一体',
              datax: '批量全量同步',
            },
            {
              dimension: '实时性',
              canal: '秒级',
              flink: '毫秒级',
              datax: '分钟级',
            },
            {
              dimension: '适用场景',
              canal: '简单增量同步',
              flink: '实时数仓+计算',
              datax: '全量初始化+补数据',
            },
            {
              dimension: '运维成本',
              canal: '中',
              flink: '高',
              datax: '低',
            },
          ],
        ),
        callout(
          'danger',
          '最严重的事故',
          '字段拼接顺序不一致导致下游解析错乱：上游加了一个字段没通知下游，下游按旧顺序解析，整张表的列全部错位。这种事故不会报错，只会让数据“看起来正常但全是错的”，最难发现。',
        ),
      ],
    },
  },
  {
    collection: 'glossary',
    data: {
      title: 'Dify 工作流编排',
      description:
        '基于 Dify 平台构建的 AI 工作流，将意图识别、参数提取、工具调用和结果拼接串联成可控的 AI 应用链路。',
      lang: 'zh-CN',
      translationKey: 'glossary-dify-workflow',
      slug: 'dify-workflow',
      status: 'published',
      featured: false,
      date: DATES.glossaryDify,
      updated: DATES.glossaryDify,
      tags: ['AI 应用', 'Dify', '工作流'],
      aliases: ['Dify', 'Dify Workflow', 'AI 工作流编排'],
      content: rt([
        h(2, '我的理解'),
        p(
          'Dify 工作流的价值是让 AI 问数从一次性 Demo 变成可控的业务链路。通过意图识别、参数提取、指标标准化、权限校验、数据服务调用和结果协议拼接，把模型能力放进企业级工程框架里。核心是把业务判断从提示词里抽出来，放进工程系统。',
        ),
        p(
          '很多人用 Dify 只用到“聊天+知识库”这一层，以为接了 RAG 就算做完 AI 应用。但企业级 AI 问数不能靠 RAG 兜底——RAG 只能回答“文档里写了什么”，回答不了“上个月某项目收缴率是多少”。后者要走意图识别→参数提取→指标标准化→权限校验→数据服务→结果拼接的完整工作流，每一步都是工程节点，不是提示词能覆盖的。',
        ),
        h(2, '工作流的六个节点'),
        p(
          '我把 Dify 工作流拆成六个工程节点，每个节点解决一个不确定性来源。节点之间通过结构化数据传递，不是把上一步的自然语言输出直接塞给下一步。',
        ),
        ul([
          '意图识别：判断用户想问什么（查数、对比、趋势、明细）',
          '参数提取：从自然语言里抽出指标、时间、组织、对象',
          '指标标准化：把口语化指标名映射到语义层的 targetId',
          '权限校验：检查用户是否有权查询该组织范围的数据',
          '数据服务调用：走服务层查询，不直连数据库',
          '结果协议拼接：把结构化结果转成可解释的自然语言回答',
        ]),
        h(2, '为什么把业务判断从提示词里抽出来'),
        p(
          '提示词里写业务规则是最脆弱的方案——改一个字就可能让模型行为全变，而且无法回归测试。把业务判断抽成工程节点后，每个节点都能单独测试、单独监控、单独回滚。模型只负责语言理解，业务规则由工程系统保证。',
        ),
      ]),
      contentBlocks: [
        statGrid(
          [
            { value: '6', label: '工作流节点' },
            { value: '0', label: '提示词业务规则' },
            { value: '1', label: '统一权限入口' },
            { value: '100%', label: '节点可单独测试' },
          ],
          4,
        ),
        steps('一次 AI 问数在工作流里的流转', [
          '用户问“上个月某项目收缴率多少”，进入意图识别节点。',
          '意图识别判定为“查数”类，进入参数提取节点。',
          '参数提取抽出指标=收缴率、时间=上月、对象=某项目，进入指标标准化节点。',
          '指标标准化把“收缴率”映射到 targetId=metric_payment_rate，进入权限校验节点。',
          '权限校验检查用户是否有权看该项目数据，通过后进入数据服务调用节点。',
          '数据服务返回结构化结果，结果协议拼接节点转成“上月某项目收缴率为 92.7%”回答用户。',
        ]),
        code(
          'dify-workflow-node.ts',
          'ts',
          `type WorkflowNode<TInput, TOutput> = {
  id: string;
  type: 'intent' | 'extract' | 'normalize' | 'authorize' | 'query' | 'format';
  input: TInput;
  output: TOutput;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  error?: { code: string; message: string };
  duration?: number;         // 节点耗时（监控用）
};

// 每个节点都是可独立测试的纯函数
type IntentNode = WorkflowNode<
  { question: string },
  { intent: 'query' | 'compare' | 'trend' | 'detail' }
>;`,
        ),
        compareTable(
          '提示词驱动与工作流驱动对照',
          [
            { key: 'dimension', label: '维度' },
            { key: 'prompt', label: '提示词驱动' },
            { key: 'workflow', label: '工作流驱动', highlight: true },
          ],
          [
            {
              dimension: '业务规则',
              prompt: '写在提示词里',
              workflow: '抽成工程节点',
            },
            {
              dimension: '可测试性',
              prompt: '只能整体跑',
              workflow: '每节点单独测',
            },
            {
              dimension: '可监控性',
              prompt: '只看到最终输出',
              workflow: '每节点有状态和耗时',
            },
            {
              dimension: '可回滚性',
              prompt: '改提示词全量影响',
              workflow: '改单节点不影响其他',
            },
            {
              dimension: '权限控制',
              prompt: '提示词里写规则',
              workflow: '独立权限校验节点',
            },
          ],
        ),
        callout(
          'tip',
          '落地建议',
          '不要一上来就搭六个节点。先从意图识别+数据服务调用两个节点跑通最小闭环，再逐步叠加参数提取、指标标准化、权限校验和结果拼接。每加一个节点都要有回归用例兜底。',
        ),
        quote(
          'Dify 工作流的核心不是把 Dify 用熟，而是把业务判断从提示词里赶出去。提示词负责语言，工程系统负责业务，两者混在一起就会失控。',
          '曾迪',
          'AI 问数工作流复盘',
        ),
      ],
    },
  },
  {
    collection: 'timeline',
    data: {
      title: '从数据看板走向 AI 应用工作台',
      description:
        '个人能力主线的一次迁移：把过去在 BI、低代码、指标链路和后端服务中的经验，迁移到 AI 问数和 Agent 工作台建设中。',
      lang: 'zh-CN',
      translationKey: 'timeline-data-product-to-ai-application',
      slug: 'data-product-to-ai-application',
      status: 'published',
      featured: true,
      date: DATES.timelineAiMigration,
      updated: DATES.timelineAiMigration,
      tags: [...commonTags, '成长线'],
      kind: 'milestone',
      content: rt([
        h(2, '这个节点的意义'),
        p(
          '我开始更明确地把自己定位为“能把 AI 放进真实业务系统里的人”，而不是只做单点页面或单点模型调用。过去的低代码、BI、数仓和微服务经验，正在成为 AI 应用落地的基础设施能力。',
        ),
      ]),
    },
  },
  {
    collection: 'timeline',
    data: {
      title: '把个人站点建设成可验证的履历系统',
      description:
        '这个站点不只是展示页，也会承载项目案例、专题、知识库、动态 CMS、发布工作流和后续 AI 检索。',
      lang: 'zh-CN',
      translationKey: 'timeline-personal-site-as-profile-system',
      slug: 'personal-site-as-profile-system',
      status: 'published',
      featured: false,
      date: DATES.timelinePersonalSite,
      updated: DATES.timelinePersonalSite,
      tags: ['个人站点', '内容平台', '履历系统'],
      kind: 'release',
      content: rt([
        h(2, '为什么要这样做'),
        p(
          '传统简历只能压缩经历，而个人内容站可以展开经历：项目可以有背景、取舍、边界、技术栈和后续演进；知识库可以展示长期学习；专题可以把看似分散的能力串成一条线。',
        ),
      ]),
    },
  },
  {
    collection: 'timeline',
    data: {
      title: '本科：信阳师范 - 信息管理与信息系统',
      description: '2013-2017 年就读于信阳师范信息管理与信息系统专业，获本科学历。交叉背景为后续理解业务口径、产品边界和工程交付打下基础。',
      lang: 'zh-CN',
      translationKey: 'timeline-education-xinyang',
      slug: 'education-xinyang',
      status: 'published',
      featured: false,
      date: DATES.timelineEducation,
      updated: DATES.timelineEducation,
      tags: ['教育', '信息管理'],
      kind: 'learning',
      content: rt([
        h(2, '专业背景'),
        p(
          '信息管理与信息系统专业兼具管理学与信息技术交叉视角，让我在后来的企业数据智能和 AI 应用落地中，更容易理解业务口径、产品边界和工程交付之间的关系。英语四级，具备基本的英文技术文档阅读能力。',
        ),
      ]),
    },
  },
  {
    collection: 'timeline',
    data: {
      title: '第一份工作：IoT 智能硬件与小程序开发',
      description:
        '2019.03-2020.04 在浙江聚物智享科技有限公司，参与 IoT 智能硬件设备对接与配套小程序开发，覆盖设备绑定、状态展示、扫码、订单与用户端交互。',
      lang: 'zh-CN',
      translationKey: 'timeline-first-job-iot',
      slug: 'first-job-iot',
      status: 'published',
      featured: false,
      date: DATES.timelineFirstJob,
      updated: DATES.timelineFirstJob,
      tags: ['IoT', '小程序', '前端'],
      kind: 'milestone',
      content: rt([
        h(2, '工程起点'),
        p(
          '完成前端页面、微信小程序、接口联调与设备数据展示相关工作。这段经历为后续企业级业务系统开发打下工程基础，也让我第一次完整体验了从设备端到用户端的链路闭环。',
        ),
      ]),
    },
  },
  {
    collection: 'timeline',
    data: {
      title: '三次年度优秀员工',
      description:
        '2021 年度优秀员工 - 生机勃勃星；2022 年度优秀员工 - 飞跃进步星；2024 年度优秀员工 - 研发经理星。记录了从前端开发到数据产品、再到带团队和 AI 应用工程的成长轨迹。',
      lang: 'zh-CN',
      translationKey: 'timeline-awards-outstanding',
      slug: 'awards-outstanding',
      status: 'published',
      featured: true,
      date: DATES.timelineAwards,
      updated: DATES.timelineAwards,
      tags: ['荣誉', '成长线'],
      kind: 'milestone',
      content: rt([
        h(2, '成长轨迹'),
        p(
          '2021 年生机勃勃星代表刚进入数据产品领域的冲劲，2022 年飞跃进步星代表在低代码和后端方向的突破，2024 年研发经理星代表在团队带领和 AI 应用工程方向上的认可。三次获奖串联起来，就是一条从前端开发走向全栈与 AI 应用的成长线。',
        ),
      ]),
    },
  },
];

const payload = await getPayload({ config });

let created = 0;
let updated = 0;

for (const doc of docs) {
  const existing = await payload.find({
    collection: doc.collection,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      slug: {
        equals: doc.data.slug,
      },
    },
  });

  if (existing.totalDocs > 0) {
    await payload.update({
      collection: doc.collection,
      id: existing.docs[0].id,
      data: doc.data,
      overrideAccess: true,
    });
    updated += 1;
    payload.logger.info(`Updated ${doc.collection}: ${doc.data.title}`);
  } else {
    await payload.create({
      collection: doc.collection,
      data: doc.data,
      overrideAccess: true,
    });
    created += 1;
    payload.logger.info(`Created ${doc.collection}: ${doc.data.title}`);
  }
}

payload.logger.info(`Profile seed finished. Created ${created}, updated ${updated}.`);

await payload.destroy();

process.exit(0);
