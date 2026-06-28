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

type SeedDoc = {
  collection: SeedCollection;
  data: Record<string, unknown> & { slug: string; title: string };
};

const now = '2026-06-28T00:00:00.000Z';

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

const commonTags = ['个人履历', '数据智能', 'AI 应用', '全栈工程'];

const docs: SeedDoc[] = [
  {
    collection: 'topics',
    data: {
      title: '个人能力图谱：数据产品、低代码平台与 AI 工作台',
      description:
        '把我过去几年做过的数据产品、低代码平台、指标链路、AI 问数和全栈工程实践组织成一条可阅读的个人能力主线。',
      lang: 'zh-CN',
      translationKey: 'topic-personal-engineering-profile',
      slug: 'personal-engineering-profile',
      status: 'published',
      featured: true,
      date: now,
      updated: now,
      tags: [...commonTags, '专题'],
      items: [
        '/zh-CN/projects/ai-native-data-analysis-workbench',
        '/zh-CN/projects/ai-data-assistant-mobile-platform',
        '/zh-CN/projects/data-intelligence-bi-low-code-platform',
        '/zh-CN/projects/data-intelligence-backend-realtime-chain',
        '/zh-CN/posts/from-bi-lowcode-to-ai-workbench',
        '/zh-CN/knowledge/enterprise-data-intelligence-stack',
      ],
      content: rt([
        h(2, '这个专题不是简历搬运'),
        p(
          '我更希望这里呈现的是一条连续的能力线：从企业业务问题出发，把数据口径、指标模型、配置化平台、前端交互、后端链路和 AI 工作流串成能被真实团队使用的系统。',
        ),
        p(
          '简历通常把经历切成项目块，但真实工作不是这样发生的。一个看板不好用，背后可能是指标口径不稳；一个 AI 问数答不准，背后可能是权限、组织树、数据服务协议和语义层没有打通。这个专题会尽量把这些连接关系讲清楚。',
        ),
        h(2, '我身上的几条主线'),
        ul([
          '数据产品主线：BI 设计器、管理驾驶舱、图表协议、指标管理、标签平台和数据消费体验。',
          '低代码主线：表单设计器、门户配置、控件体系、JSON 配置回显、移动端适配和运行时边界。',
          '数据工程主线：DataX/CDC、DWD/DWS、预统计 SQL、调度辅助工具、指标写入和口径校验。',
          'AI 应用主线：Dify 工作流、LLM Provider、智能问数、流式对话、追问推荐、Agent 执行状态和多轮上下文。',
          '全栈工程主线：Next.js、Node.js、PostgreSQL、Redis、Java 微服务、OpenFeign、MyBatis、Docker 和发布链路。',
        ]),
        h(2, '推荐阅读方式'),
        p(
          '如果你想快速判断我适合什么岗位，先看 AI 原生数据分析工作台和企业 AI 问数两个项目；如果你想判断工程深度，再看 BI 低代码平台、后端实时链路和企业数据智能应用栈。',
        ),
      ]),
    },
  },
  {
    collection: 'projects',
    data: {
      title: 'AI 原生数据分析工作台',
      description:
        '一个面向数据分析场景的 AI 工作台实践：自然语言进入，经过意图、语义查询、执行计划、异步任务和结论组织，最后回到可追问的分析会话。',
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
        h(2, '项目关注的问题'),
        p(
          '我不想把 AI 数据分析做成一个“聊天框套接口”。真实业务里的问数，需要知道问的是什么指标、在哪个组织范围、时间边界怎么算、哪些数据能看、执行过程是否可信，以及结论能不能被继续追问。',
        ),
        h(2, '工程取舍'),
        ul([
          '用 Clean Architecture / Ports and Adapters 把领域模型、应用用例、基础设施和 Next.js 表现层拆开，避免所有逻辑堆在 API route 里。',
          '把分析链路拆成意图解析、候选因素扩展、计划生成、执行队列、状态流和结果持久化，让长任务有可观察的过程。',
          '通过 Redis 队列和 Worker 承载后台任务，前端只订阅状态，不假装所有分析都能同步完成。',
          '把权限作为服务端强约束，而不是前端筛选条件，避免 AI 生成查询时绕开组织、项目或角色边界。',
        ]),
        h(2, '我想继续打磨的地方'),
        p(
          '这个项目后续最有价值的方向，不是再堆更多模型调用，而是把评估集、语义层、数据血缘和结论解释做扎实，让 AI 分析从“能演示”走向“能复盘”。',
        ),
      ]),
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
        h(2, '不是把问题直接丢给大模型'),
        p(
          '企业问数最怕“听起来很聪明，查出来不可信”。我参与的链路会先把自然语言拆成标准指标、组织、时间、图表类型和数据服务入参，再把结果组装成前端能稳定渲染的协议。',
        ),
        h(2, '我处理过的关键环节'),
        ul([
          '把指标识别从纯提示词提取调整为“标准指标参数 + targetId”的链路，减少指标漂移。',
          '接入组织检索和权限树，支持集团、区域、项目等层级识别，并对空组织、无权限和业务失败做明确兜底。',
          '设计追问推荐，把指标、时间、组织和近 12 个月等常见分析动作变成可点击的下一步。',
          '在移动端 Chat 里兼容流式响应、历史会话、停止生成、反馈、建议问题、文件上传和图表结果渲染。',
        ]),
        h(2, '这个项目体现的能力'),
        p(
          '它同时考验 AI 工作流、业务指标理解、前端协议设计、移动端兼容和工程兜底。对我来说，它是从传统数据产品走向 AI 应用的关键过渡项目。',
        ),
      ]),
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
        h(2, '我理解的 BI 设计器'),
        p(
          'BI 设计器不是把图表拖上画布这么简单。真正难的是让模板 JSON、设计态结构、渲染态协议、图表异步加载、历史记录、多端布局和数据权限能长期共存。',
        ),
        h(2, '承担过的工作'),
        ul([
          '参与两级设计器建设：一级处理模板 CRUD、拖拽布局、撤销/重做和全局主题；二级处理图表数据源、维度指标和图表配置。',
          '维护 JSON 驱动的模板渲染链路，支持设计态和只读态复用。',
          '建设 40+ 图表组件注册与异步加载体系，覆盖常规图表、地图、表格、轮播、Tab、iframe 和 3D 背景。',
          '用 IndexedDB 承载复杂模板编辑历史，降低撤销/重做对内存状态的依赖。',
          '处理 Vue 2 深层响应式合并、图表联动、移动端表格侧滑、大屏地图高亮等细节问题。',
        ]),
        h(2, '这段经历给我的底层能力'),
        p(
          '它让我形成了对“配置化产品”的敬畏：配置不是万能解法，必须有清晰的 schema、可回显的编辑器、可调试的协议和能收敛的边界。',
        ),
      ]),
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
        h(2, '项目定位'),
        p(
          '这个平台解决的是企业系统里大量“相似但又不完全一样”的页面交付问题：表单、列表、筛选条件、操作按钮、树表结构、移动端模板和门户页面。',
        ),
        h(2, '我投入较多的部分'),
        ul([
          '维护表单控件包，覆盖基础控件、系统控件、高级控件、自定义控件和文本控件。',
          '支持表单 JSON 导入、生成、预览和配置回显，让配置能迁移、能调试、能复用。',
          '参与列表字段拖拽排序、筛选条件配置、按钮权限配置、树配置校验等复杂配置面板。',
          '参与门户管理与主题设计，支持企业门户页面配置、主题切换和组件包复用。',
        ]),
        h(2, '我从这里学到的'),
        p(
          '低代码平台的核心不是“少写代码”，而是把业务变化收敛到可理解的配置模型里。做不好模型，最后只是把复杂度从代码转移到了配置 JSON。',
        ),
      ]),
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
        h(2, '这条链路为什么重要'),
        p(
          '前台看板和 AI 问数都离不开稳定的数据底座。业务源表进入数据中心后，需要经过抽取、明细建模、预统计、指标写入和调度，最后才能变成用户看到的一张图或一句结论。',
        ),
        h(2, '做过的事情'),
        ul([
          '编写和维护 DataX JSON 配置，处理字段映射、增量条件、目标表写入和同步一致性。',
          '编写 DWD 明细层建表 SQL，围绕企业、组织、项目、时间等公共维度组织宽表字段。',
          '编写 DWS/预统计 SQL，承载月度、年度、日度、多组织层级指标。',
          '参与收费、预收预存、收缴率、满意度、项目画像、工单、品质、HR 等指标脚本开发和口径修正。',
          '编写 Python 调度辅助工具，处理任务触发、组织省份补全和任务变体等自动化场景。',
        ]),
        h(2, '沉淀下来的经验'),
        p(
          '指标链路里最贵的不是 SQL 本身，而是口径误差、边界日期、分组兼容、临时表重复引用和失败重跑。它要求人既懂业务，也要能对数据结果负责。',
        ),
      ]),
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
        h(2, '服务层的价值'),
        p(
          '数据产品前端要稳定，服务层必须把权限、指标、维度、排序、分页、明细钻取、导出和数据来源差异统一起来。否则前端每多一种图表，就会多一套不可控的查询逻辑。',
        ),
        h(2, '关键工作'),
        ul([
          '维护图表服务新链路，把柱状图、折线图、饼图、地图、指标卡、表格、导出和明细查询接入数据中心链路。',
          '基于图表配置生成标准查询对象，统一组织/项目权限、维度、指标、时间、排序分页、同比环比和地图经纬度处理。',
          '通过 OpenFeign 打通 view 到 datacenter 的跨服务查询，把 DWS 指标、DWD 明细、分子分母和网格树封装成前端协议。',
          '维护标签中台能力，支持标签实体、分类、分群、任务、字典、SQL 预览、执行写回和调度日志。',
          '维护 CDC + ETL 链路，处理全量初始化、binlog 增量、业务主键生成、幂等、锁、动态 SQL 和失败恢复。',
        ]),
        h(2, '我看重的后端能力'),
        p(
          '这类系统不是只把接口写通。真正重要的是链路可解释、失败可恢复、权限不绕过、口径能对齐，历史客户部署差异也能被稳住。',
        ),
      ]),
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
        h(2, '我希望别人看到的不是“会很多技术”'),
        p(
          '技术栈可以列很长，但我更想表达的是：我习惯把一个问题从业务、数据、前端、后端、AI 编排和交付维护一起看。这个习惯比某一个框架更能说明我适合做什么。',
        ),
      ]),
      contentBlocks: [
        {
          blockType: 'statGridBlock',
          columns: 3,
          items: [
            { value: '数据产品', label: 'BI、指标、标签、管理驾驶舱' },
            { value: '平台工程', label: '低代码、配置协议、微前端、多端适配' },
            { value: 'AI 应用', label: '问数、Agent、工作流、流式会话' },
          ],
        },
        {
          blockType: 'calloutBlock',
          variant: 'tip',
          title: '这篇文章适合作为个人介绍入口',
          content:
            '它不是项目清单，而是解释这些项目之间为什么有关联：数据产品经验让 AI 应用更接地气，AI 应用又反过来要求数据底座更标准。',
        },
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
        h(2, '追问也是产品能力'),
        p(
          '智能追问不是随便生成几个问题。好的追问应该知道当前指标还能按时间下钻、按组织对比、看近 12 个月趋势，或者切换到相关指标。它本质上是把数据分析路径产品化。',
        ),
      ]),
      contentBlocks: [
        {
          blockType: 'compareTableBlock',
          caption: '两类问数产品的差异',
          columns: [
            { key: 'dimension', label: '维度' },
            { key: 'demo', label: 'Demo 型问数' },
            { key: 'system', label: '系统型问数', highlight: true },
          ],
          rows: [
            {
              data: {
                dimension: '指标',
                demo: '提示词里猜',
                system: '标准指标、targetId、口径说明',
              },
            },
            {
              data: {
                dimension: '权限',
                demo: '回答后再过滤',
                system: '服务端查询前置校验',
              },
            },
            {
              data: {
                dimension: '结果',
                demo: '自然语言文本',
                system: '卡片、图表、表格、追问协议',
              },
            },
          ],
        },
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
        h(2, '排查顺序'),
        ul([
          '先看用户问题是否能映射到稳定指标和组织范围。',
          '再看数据服务是否能在同样参数下返回可复现结果。',
          '继续看 DWS/DWD 是否存在口径或时间边界问题。',
          '最后才看模型提示词、追问策略和前端展示。',
        ]),
      ]),
      contentBlocks: [
        {
          blockType: 'stepsBlock',
          title: '从数据到 AI 结论的路径',
          items: [
            { text: '业务源表进入 DataX / CDC 抽取链路。' },
            { text: 'DWD 明细层统一组织、项目、时间等公共维度。' },
            { text: 'DWS 和预统计 SQL 产出指标结果。' },
            { text: '数据服务封装权限、维度、排序、分页和明细钻取。' },
            { text: 'BI / AI 问数 / Agent 工作台消费统一协议。' },
          ],
        },
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
