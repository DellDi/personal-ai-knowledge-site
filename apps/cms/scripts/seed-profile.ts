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

type SlateLeaf = {
  text: string;
};

type SlateNode = {
  children: Array<SlateLeaf | SlateNode>;
  type?: string;
};

type BlockData = Record<string, unknown> & {
  blockType: string;
};

type SeedDoc = {
  collection: SeedCollection;
  data: Record<string, unknown> & { slug: string; title: string };
};

const now = '2026-06-28T00:00:00.000Z';
const commonTags = ['个人履历', '数据智能', 'AI 应用', '全栈工程'];

function text(value: string): SlateLeaf {
  return { text: value };
}

function p(value: string): SlateNode {
  return { children: [text(value)] };
}

function h(level: 2 | 3, value: string): SlateNode {
  return { type: `h${level}`, children: [text(value)] };
}

function ul(items: string[]): SlateNode {
  return {
    type: 'ul',
    children: items.map((item) => ({ type: 'li', children: [text(item)] })),
  };
}

function rt(nodes: SlateNode[]): SlateNode[] {
  return nodes;
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
        '一条从 BI、低代码、指标链路、后端服务到 AI 工作台的能力主线，展示我如何把复杂业务问题拆成可运行、可验证、可演进的系统。',
      lang: 'zh-CN',
      translationKey: 'topic-personal-engineering-profile',
      slug: 'personal-engineering-profile',
      status: 'published',
      featured: true,
      date: now,
      updated: now,
      tags: [...commonTags, '专题', '能力图谱'],
      items: [
        '/zh-CN/projects/ai-native-data-analysis-workbench',
        '/zh-CN/projects/ai-data-assistant-mobile-platform',
        '/zh-CN/projects/data-intelligence-bi-low-code-platform',
        '/zh-CN/projects/data-intelligence-backend-realtime-chain',
        '/zh-CN/posts/from-bi-lowcode-to-ai-workbench',
        '/zh-CN/knowledge/enterprise-data-intelligence-stack',
      ],
      content: rt([
        h(2, '我想展示的不是履历长度'),
        p(
          '这个专题的核心不是把工作经历重新排版，而是把我解决问题的方式展开：先判断业务问题属于口径、流程、数据、交互还是系统边界，再选择合适的工程形态。',
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
          'DellDi',
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
        '一个面向数据分析场景的 AI 工作台实践：自然语言进入，经过意图识别、语义查询、执行计划、异步任务和结论组织，回到可追问的分析会话。',
      lang: 'zh-CN',
      translationKey: 'project-ai-native-data-analysis-workbench',
      slug: 'ai-native-data-analysis-workbench',
      status: 'published',
      featured: true,
      date: now,
      updated: now,
      tags: ['AI 工作台', 'Agent', '数据分析', '全栈工程'],
      role: '全栈开发 / AI 应用架构实践',
      stack: ['Next.js', 'React', 'TypeScript', 'PostgreSQL', 'Redis', 'Drizzle', 'Neo4j', 'Cube', 'LLM'],
      links: [],
      content: rt([
        h(2, '设计起点：分析不是一次回答'),
        p(
          '这个项目最重要的判断是：数据分析不是“用户问一句，模型答一句”。真实分析更像一段可追踪的任务过程，包含意图、约束、计划、执行、结果、追问和复盘。',
        ),
        p(
          '所以我更关注系统能不能把 AI 的不确定性关进边界里：计划能不能展示，执行能不能中断，失败原因能不能读懂，结论能不能回到原始数据和语义模型。',
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
        '围绕物业经营场景建设的 AI 问数编排和跨端对话体验，把 Dify 工作流、指标标准化、组织权限、图表协议和移动端渲染放到一条链路里。',
      lang: 'zh-CN',
      translationKey: 'project-ai-data-assistant-mobile-platform',
      slug: 'ai-data-assistant-mobile-platform',
      status: 'published',
      featured: true,
      date: now,
      updated: now,
      tags: ['Dify', '智能问数', '移动端', '经营分析'],
      role: 'AI 应用开发 / 工作流编排 / 移动端平台开发',
      stack: ['Dify Workflow', 'Qwen', 'OpenAI-compatible API', 'UniApp', 'Vue 2', 'SSE', 'ECharts', 'JSBridge'],
      links: [],
      content: rt([
        h(2, '核心判断：问数不是问答'),
        p(
          '企业问数如果只靠提示词，很容易出现“听起来合理，但口径不对”的结果。我参与的链路会先把自然语言问题变成标准指标、组织、时间、图表类型和数据服务入参，再输出结构化结果。',
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
        '围绕企业管理驾驶舱建设的 BI 设计器和图表渲染体系，覆盖模板设计、图表配置、多端适配、指标拖拽、联动交互和发布渲染。',
      lang: 'zh-CN',
      translationKey: 'project-data-intelligence-bi-low-code-platform',
      slug: 'data-intelligence-bi-low-code-platform',
      status: 'published',
      featured: true,
      date: now,
      updated: now,
      tags: ['BI', '低代码', '大屏', '数据产品'],
      role: '核心前端开发 / 数据产品工程化参与者',
      stack: ['Vue 2.7', 'Vuex', 'ECharts', 'G2Plot', 'Three.js', 'IndexedDB', 'Vite', 'Webpack'],
      links: [],
      content: rt([
        h(2, '设计器的难点不是拖拽'),
        p(
          'BI 设计器真正难的地方，是让模板 JSON、设计态结构、渲染态协议、图表异步加载、历史记录、多端布局和数据权限长期共存。',
        ),
        p(
          '我在这个项目里更关注“配置如何被生产、保存、回显、发布和消费”。这也是后来我做 AI 工作流时反复复用的思路。',
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
          'DellDi',
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
        '面向企业业务系统快速交付的表单、列表、门户和主题配置平台，把重复页面开发抽象成可迁移、可预览、可回显的配置体系。',
      lang: 'zh-CN',
      translationKey: 'project-enterprise-lowcode-form-portal-platform',
      slug: 'enterprise-lowcode-form-portal-platform',
      status: 'published',
      featured: false,
      date: now,
      updated: now,
      tags: ['低代码', '表单设计器', '门户', '前端工程'],
      role: '主要前端开发',
      stack: ['Vue 2', 'Vuex', 'Element UI', 'vuedraggable', 'grid-layout', 'html2canvas', 'driver.js'],
      links: [],
      content: rt([
        h(2, '它解决的是企业系统里的重复交付'),
        p(
          '表单、列表、筛选、按钮、树表、门户和移动端模板，看起来都是页面问题，本质是“业务形态相似但差异很多”的交付问题。',
        ),
        h(2, '我更关注配置的生命周期'),
        p(
          '配置不是保存到数据库就结束。它还要能导入、预览、回显、迁移、校验、发布、回滚，并能被不同端的运行时消费。',
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
        '围绕企业数据中台建设的数据抽取、明细落仓、预统计、指标结果写入和调度辅助链路，连接源系统、数仓分层和下游看板。',
      lang: 'zh-CN',
      translationKey: 'project-data-warehouse-metric-pipeline',
      slug: 'data-warehouse-metric-pipeline',
      status: 'published',
      featured: false,
      date: now,
      updated: now,
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
        '围绕 BI 图表服务、数据中心查询、标签中台、CDC 同步和低代码运行时建设的 Java 后端与实时链路实践。',
      lang: 'zh-CN',
      translationKey: 'project-data-intelligence-backend-realtime-chain',
      slug: 'data-intelligence-backend-realtime-chain',
      status: 'published',
      featured: true,
      date: now,
      updated: now,
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
          '这类后端不是简单 CRUD。它处在业务库、数据中心、BI 前端和标签任务之间，既要理解数据口径，也要处理动态 SQL、多数据源、幂等、锁和失败恢复。',
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
    collection: 'posts',
    data: {
      title: '从 BI 低代码到 AI 工作台：我的工程主线',
      description:
        '整理我从数据产品、低代码平台、数仓指标链路走向 AI 应用开发的能力迁移，不把 AI 当作孤立技能，而是放回业务系统里看。',
      lang: 'zh-CN',
      translationKey: 'post-from-bi-lowcode-to-ai-workbench',
      slug: 'from-bi-lowcode-to-ai-workbench',
      status: 'published',
      featured: true,
      date: now,
      updated: now,
      tags: [...commonTags, '工程复盘'],
      category: '个人复盘',
      series: '个人能力图谱',
      content: rt([
        h(2, '我不是从模型开始理解 AI 应用的'),
        p(
          '我对 AI 应用的理解，更多来自过去做数据产品和低代码平台时遇到的问题：用户真正要的不是一个炫酷界面，而是把业务口径、数据结果、权限边界和下一步动作连接起来。',
        ),
        p(
          'BI 低代码平台让我理解配置化和可视化，数仓指标链路让我理解数据可信，后端微服务让我理解服务边界，移动端 AI 问数让我理解交互闭环。这些东西叠在一起，才是我现在做 AI 工作台的底层经验。',
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
      date: now,
      updated: now,
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
      date: now,
      updated: now,
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
          '它解释了为什么我不太愿意把 AI 应用只理解成模型调用。只要进入企业数据场景，AI 的每一句回答都依赖上游数据链路、口径治理、权限模型和结果展示协议。',
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
      date: now,
      updated: now,
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
    collection: 'resources',
    data: {
      title: '个人能力图谱阅读路线',
      description: '一份给自己和面试官看的阅读路线，把项目案例、文章、知识库和术语按能力主线组织起来。',
      lang: 'zh-CN',
      translationKey: 'resource-personal-profile-reading-route',
      slug: 'personal-profile-reading-route',
      status: 'published',
      featured: true,
      date: now,
      updated: now,
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
      date: now,
      updated: now,
      tags: ['数据智能', '指标'],
      aliases: ['指标定义', '口径治理', 'targetId'],
      content: rt([
        h(2, '我的理解'),
        p(
          '指标口径不是字段说明，而是业务、数据和产品之间的契约。没有稳定口径，BI 看板会吵架，AI 问数会漂移，数据分析也无法复盘。',
        ),
      ]),
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
      date: now,
      updated: now,
      tags: ['数据产品', '工程化'],
      aliases: ['数据产品能力', '数据应用工程'],
      content: rt([
        h(2, '我的理解'),
        p(
          '数据产品工程化关注的不是“做一张图”，而是图背后的口径、权限、查询性能、联动协议、异常兜底、调度稳定性和用户能否理解结果。',
        ),
      ]),
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
      date: now,
      updated: now,
      tags: ['AI 问数', '数据建模'],
      aliases: ['Semantic Layer', 'Cube 语义层'],
      content: rt([
        h(2, '我的理解'),
        p(
          '语义层的价值是让“收缴率”“近 12 个月”“某区域项目”这类业务表达可以稳定落到指标、维度和查询上。它越清楚，AI 问数越不容易胡猜。',
        ),
      ]),
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
      date: now,
      updated: now,
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
      date: now,
      updated: now,
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
