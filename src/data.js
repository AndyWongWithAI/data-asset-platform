const D = {
  "meta": {
    "title": "数据资产管理平台",
    // 种子结构版本：后端持久化 data.json 版本落后/缺失时自动重种，避免 stale 数据掩盖新增字段。
    // ⚠️ 任何改动种子结构（增删实体/字段/枚举）都必须 +1，否则线上旧 data.json 不会被重种。
    "schemaVersion": 3,
    "disclaimer": "⚠ 参考模型声明：基于申菱环境公开业务信息构建的演示模型，非申菱环境实际部署、仅供演示。不虚构内部运营数据。",
    "stats": {
      "applications": 5,
      "databases": 5,
      "tables": 10,
      "fields": 51,
      "rules": 8,
      "baseTerms": 28,
      "valueDomains": 6,
      "refDatas": 5,
      "infoItems": 10,
      "masterData": 5,
      "lineage": 9,
      "batchFiles": 8,
      "prodMetadatas": 3,
      "services": 5,
      "securityCatalog": 13,
      "portalAssets": 8,
      "portalRequests": 4
    }
  },
  "applications": [
    {
      "id": "app_plm",
      "name": "研发设计系统",
      "desc": "产品研发/BOM/工艺设计（PLM）"
    },
    {
      "id": "app_mes",
      "name": "生产制造系统",
      "desc": "生产订单/工序/质检（MES）"
    },
    {
      "id": "app_crm",
      "name": "营销服务系统",
      "desc": "客户/合同/订单（CRM）"
    },
    {
      "id": "app_pm",
      "name": "集成实施系统",
      "desc": "数据中心液冷工程实施与维保（PM）"
    },
    {
      "id": "app_dcim",
      "name": "智慧运维系统",
      "desc": "遥测/告警/能耗/维保（DCIM）"
    }
  ],
  "databases": [
    {
      "id": "db_plm",
      "appId": "app_plm",
      "name": "研发设计库",
      "type": "PostgreSQL"
    },
    {
      "id": "db_mes",
      "appId": "app_mes",
      "name": "生产制造库",
      "type": "Oracle"
    },
    {
      "id": "db_crm",
      "appId": "app_crm",
      "name": "营销服务库",
      "type": "MySQL"
    },
    {
      "id": "db_pm",
      "appId": "app_pm",
      "name": "项目实施库",
      "type": "SQL Server"
    },
    {
      "id": "db_dcim",
      "appId": "app_dcim",
      "name": "运维监控库",
      "type": "时序库"
    }
  ],
  "bizDomains": [
    {
      "id": "bd_rnd",
      "name": "研发设计域",
      "subjects": [
        {
          "id": "bs_device",
          "name": "产品设计"
        },
        {
          "id": "bs_bom",
          "name": "物料"
        },
        {
          "id": "bs_process",
          "name": "工艺"
        }
      ]
    },
    {
      "id": "bd_mes",
      "name": "生产制造域",
      "subjects": [
        {
          "id": "bs_order",
          "name": "生产订单"
        },
        {
          "id": "bs_inspection",
          "name": "质检"
        }
      ]
    },
    {
      "id": "bd_crm",
      "name": "营销服务域",
      "subjects": [
        {
          "id": "bs_project",
          "name": "项目合同"
        }
      ]
    },
    {
      "id": "bd_pm",
      "name": "集成实施域",
      "subjects": [
        {
          "id": "bs_commissioning",
          "name": "调试实施"
        }
      ]
    },
    {
      "id": "bd_ops",
      "name": "智慧运维域",
      "subjects": [
        {
          "id": "bs_telemetry",
          "name": "遥测"
        },
        {
          "id": "bs_alarm",
          "name": "告警"
        },
        {
          "id": "bs_energy",
          "name": "能耗"
        }
      ]
    }
  ],
  "security": [
    {
      "level": "L1",
      "name": "公开",
      "desc": "可对外公开",
      "mask": null
    },
    {
      "level": "L2",
      "name": "内部",
      "desc": "企业内部共享",
      "mask": null
    },
    {
      "level": "L3",
      "name": "敏感",
      "desc": "受限共享，脱敏后使用",
      "mask": "字段掩码/精度降低"
    },
    {
      "level": "L4",
      "name": "涉密",
      "desc": "涉密，导出受管控",
      "mask": "核心参数隐藏"
    }
  ],
  "securityCatalog": [
    {
      "id": "sc_001",
      "category1": "项目经营域",
      "category2": "投标管理",
      "dataType": "投标书",
      "level": "L2",
      "status": "启用"
    },
    {
      "id": "sc_002",
      "category1": "项目经营域",
      "category2": "合同管理",
      "dataType": "合同",
      "level": "L3",
      "status": "启用"
    },
    {
      "id": "sc_003",
      "category1": "设计研发域",
      "category2": "产品设计",
      "dataType": "液冷设备数据",
      "level": "L2",
      "status": "启用"
    },
    {
      "id": "sc_004",
      "category1": "设计研发域",
      "category2": "物料管理",
      "dataType": "BOM物料数据",
      "level": "L3",
      "status": "启用"
    },
    {
      "id": "sc_005",
      "category1": "设计研发域",
      "category2": "工艺设计",
      "dataType": "核心工艺参数数据",
      "level": "L4",
      "status": "启用"
    },
    {
      "id": "sc_006",
      "category1": "设计研发域",
      "category2": "产品设计",
      "dataType": "冷源设备数据",
      "level": "L2",
      "status": "启用"
    },
    {
      "id": "sc_007",
      "category1": "设计研发域",
      "category2": "产品设计",
      "dataType": "冷量分配单元数据",
      "level": "L3",
      "status": "启用"
    },
    {
      "id": "sc_008",
      "category1": "设计研发域",
      "category2": "产品设计",
      "dataType": "机柜参数数据",
      "level": "L2",
      "status": "启用"
    },
    {
      "id": "sc_009",
      "category1": "生产制造域",
      "category2": "生产管理",
      "dataType": "生产订单数据",
      "level": "L2",
      "status": "启用"
    },
    {
      "id": "sc_010",
      "category1": "集成实施域",
      "category2": "调试交付",
      "dataType": "调试实施记录数据",
      "level": "L2",
      "status": "启用"
    },
    {
      "id": "sc_011",
      "category1": "智慧运维域",
      "category2": "遥测监控",
      "dataType": "运行遥测数据",
      "level": "L3",
      "status": "启用"
    },
    {
      "id": "sc_012",
      "category1": "智慧运维域",
      "category2": "能效分析",
      "dataType": "能耗PUE数据",
      "level": "L2",
      "status": "启用"
    },
    {
      "id": "sc_013",
      "category1": "智慧运维域",
      "category2": "告警管理",
      "dataType": "告警记录数据",
      "level": "L2",
      "status": "启用"
    }
  ],
  "masterData": [
    {
      "id": "md_cdu",
      "code": "MD-001",
      "name": "液冷设备主数据",
      "entityType": "液冷设备",
      "definition": "液冷设备（CDU 冷量分配单元等）的权威主数据，统一设备型号、制冷量与单机柜功率等核心属性",
      "rule": "液冷设备编码全局唯一；型号/制冷量参数变更须走主数据变更审批；停用设备冻结保留历史",
      "owner": "研发设计组",
      "approvals": [
        {
          "id": "ap_md_cdu_1",
          "type": "新建申请",
          "applicant": "研发设计组",
          "applyTime": "2024-02-01",
          "approver": "数据治理组",
          "status": "通过",
          "approveTime": "2024-02-05",
          "comment": "液冷设备主数据编码规则通过，纳入主数据目录"
        },
        {
          "id": "ap_md_cdu_2",
          "type": "变更申请",
          "applicant": "研发设计组",
          "applyTime": "2025-05-10",
          "approver": "数据治理组",
          "status": "通过",
          "approveTime": "2025-05-15",
          "comment": "新增 150kW 单机柜液冷设备型号编码"
        },
        {
          "id": "ap_md_cdu_3",
          "type": "变更申请",
          "applicant": "智慧运维组",
          "applyTime": "2025-11-20",
          "approver": "数据治理组",
          "status": "驳回",
          "approveTime": "2025-11-25",
          "comment": "停用设备主数据变更材料不全，驳回补充"
        }
      ]
    },
    {
      "id": "md_cold_source",
      "code": "MD-002",
      "name": "冷源设备主数据",
      "entityType": "冷源设备",
      "definition": "冷源设备的权威主数据，统一冷源类型、制冷量与能效等核心属性",
      "rule": "冷源编码全局唯一；冷源类型/制冷量变更须走审批；停用冷源冻结保留历史",
      "owner": "研发设计组",
      "approvals": [
        {
          "id": "ap_md_cold_source_1",
          "type": "新建申请",
          "applicant": "研发设计组",
          "applyTime": "2024-02-20",
          "approver": "数据治理组",
          "status": "通过",
          "approveTime": "2024-02-24",
          "comment": "冷源设备主数据编码规则通过"
        },
        {
          "id": "ap_md_cold_source_2",
          "type": "变更申请",
          "applicant": "研发设计组",
          "applyTime": "2025-06-01",
          "approver": "数据治理组",
          "status": "通过",
          "approveTime": "2025-06-05",
          "comment": "新增干冷器冷源规格编码"
        }
      ]
    },
    {
      "id": "md_customer",
      "code": "MD-003",
      "name": "数据中心客户主数据",
      "entityType": "数据中心客户",
      "definition": "数据中心客户的权威主数据，统一客户资质、机房规模与液冷需求等核心属性",
      "rule": "客户编码全局唯一；客户资质变更须走审批；退出客户冻结保留历史",
      "owner": "营销服务组",
      "approvals": [
        {
          "id": "ap_md_customer_1",
          "type": "新建申请",
          "applicant": "营销服务组",
          "applyTime": "2024-03-01",
          "approver": "数据治理组",
          "status": "通过",
          "approveTime": "2024-03-05",
          "comment": "数据中心客户主数据编码规则通过"
        },
        {
          "id": "ap_md_customer_2",
          "type": "变更申请",
          "applicant": "营销服务组",
          "applyTime": "2025-07-10",
          "approver": "数据治理组",
          "status": "通过",
          "approveTime": "2025-07-15",
          "comment": "新增智算中心客户机房规模变更通过"
        }
      ]
    },
    {
      "id": "md_project",
      "code": "MD-004",
      "name": "液冷项目主数据",
      "entityType": "液冷项目",
      "definition": "液冷项目的权威主数据，统一项目名称、规模与阶段等核心属性",
      "rule": "项目编码全局唯一；项目阶段变更须走审批；交付/停运状态冻结",
      "owner": "集成实施组",
      "approvals": [
        {
          "id": "ap_md_project_1",
          "type": "新建申请",
          "applicant": "集成实施组",
          "applyTime": "2024-01-15",
          "approver": "数据治理组",
          "status": "通过",
          "approveTime": "2024-01-20",
          "comment": "液冷项目主数据编码规则通过"
        },
        {
          "id": "ap_md_project_2",
          "type": "变更申请",
          "applicant": "集成实施组",
          "applyTime": "2025-09-01",
          "approver": "数据治理组",
          "status": "通过",
          "approveTime": "2025-09-05",
          "comment": "项目阶段由建设变更为运维"
        }
      ]
    },
    {
      "id": "md_supplier",
      "code": "MD-005",
      "name": "供应商主数据",
      "entityType": "供应商",
      "definition": "设备与材料供应商的权威主数据，统一供应商资质与供货范围等核心属性",
      "rule": "供应商编码全局唯一；资质变更须走审批；不良供应商冻结停用",
      "owner": "采购组",
      "approvals": [
        {
          "id": "ap_md_supplier_1",
          "type": "新建申请",
          "applicant": "采购组",
          "applyTime": "2024-01-25",
          "approver": "数据治理组",
          "status": "通过",
          "approveTime": "2024-01-30",
          "comment": "供应商主数据编码规则通过"
        },
        {
          "id": "ap_md_supplier_2",
          "type": "变更申请",
          "applicant": "采购组",
          "applyTime": "2025-10-12",
          "approver": "数据治理组",
          "status": "通过",
          "approveTime": "2025-10-16",
          "comment": "供应商资质与供货范围变更通过"
        }
      ]
    }
  ],
  "baseTerms": [
    {
      "id": "term_name",
      "nameCn": "名称",
      "nameEn": "name",
      "synonyms": [
        "名"
      ],
      "isClassWord": true,
      "status": "启用"
    },
    {
      "id": "term_code",
      "nameCn": "编码",
      "nameEn": "code",
      "synonyms": [
        "编号",
        "代码"
      ],
      "isClassWord": true,
      "status": "启用"
    },
    {
      "id": "term_quantity",
      "nameCn": "量",
      "nameEn": "quantity",
      "synonyms": [
        "数量"
      ],
      "isClassWord": true,
      "status": "启用"
    },
    {
      "id": "term_value",
      "nameCn": "值",
      "nameEn": "value",
      "synonyms": [
        "数值"
      ],
      "isClassWord": true,
      "status": "启用"
    },
    {
      "id": "term_date",
      "nameCn": "日期",
      "nameEn": "date",
      "synonyms": [],
      "isClassWord": true,
      "status": "启用"
    },
    {
      "id": "term_time",
      "nameCn": "时间",
      "nameEn": "time",
      "synonyms": [],
      "isClassWord": true,
      "status": "启用"
    },
    {
      "id": "term_datetime",
      "nameCn": "日期时间",
      "nameEn": "datetime",
      "synonyms": [
        "时间戳"
      ],
      "isClassWord": true,
      "status": "启用"
    },
    {
      "id": "term_identifier",
      "nameCn": "标识",
      "nameEn": "identifier",
      "synonyms": [
        "ID",
        "标识符"
      ],
      "isClassWord": true,
      "status": "启用"
    },
    {
      "id": "term_percent",
      "nameCn": "百分比",
      "nameEn": "percent",
      "synonyms": [
        "百分比值",
        "百分数"
      ],
      "isClassWord": true,
      "status": "启用"
    },
    {
      "id": "term_rate",
      "nameCn": "率",
      "nameEn": "rate",
      "synonyms": [
        "比率"
      ],
      "isClassWord": true,
      "status": "启用"
    },
    {
      "id": "term_device",
      "nameCn": "设备",
      "nameEn": "device",
      "synonyms": [
        "装置"
      ],
      "isClassWord": false,
      "status": "启用"
    },
    {
      "id": "term_type",
      "nameCn": "类型",
      "nameEn": "type",
      "synonyms": [
        "类别"
      ],
      "isClassWord": false,
      "status": "启用"
    },
    {
      "id": "term_consumption",
      "nameCn": "功耗",
      "nameEn": "consumption",
      "synonyms": [
        "功率消耗"
      ],
      "isClassWord": false,
      "status": "启用"
    },
    {
      "id": "term_cdu",
      "nameCn": "冷量分配单元",
      "nameEn": "cdu",
      "synonyms": [
        "CDU",
        "冷量分配"
      ],
      "isClassWord": false,
      "status": "启用"
    },
    {
      "id": "term_model",
      "nameCn": "型号",
      "nameEn": "model",
      "synonyms": [
        "规格"
      ],
      "isClassWord": false,
      "status": "启用"
    },
    {
      "id": "term_cooling",
      "nameCn": "冷却",
      "nameEn": "cooling",
      "synonyms": [
        "散热",
        "制冷"
      ],
      "isClassWord": false,
      "status": "启用"
    },
    {
      "id": "term_mode",
      "nameCn": "方式",
      "nameEn": "mode",
      "synonyms": [
        "模式"
      ],
      "isClassWord": false,
      "status": "启用"
    },
    {
      "id": "term_coolant",
      "nameCn": "冷却液",
      "nameEn": "coolant",
      "synonyms": [
        "冷却介质",
        "载冷剂"
      ],
      "isClassWord": false,
      "status": "启用"
    },
    {
      "id": "term_cold_source",
      "nameCn": "冷源",
      "nameEn": "cold_source",
      "synonyms": [
        "冷源设备",
        "冷却源"
      ],
      "isClassWord": false,
      "status": "启用"
    },
    {
      "id": "term_efficiency",
      "nameCn": "能效",
      "nameEn": "efficiency",
      "synonyms": [
        "能效比",
        "效率"
      ],
      "isClassWord": false,
      "status": "启用"
    },
    {
      "id": "term_supply",
      "nameCn": "供液",
      "nameEn": "supply",
      "synonyms": [
        "供液侧",
        "进水"
      ],
      "isClassWord": false,
      "status": "启用"
    },
    {
      "id": "term_temperature",
      "nameCn": "温度",
      "nameEn": "temperature",
      "synonyms": [
        "温度值"
      ],
      "isClassWord": false,
      "status": "启用"
    },
    {
      "id": "term_return",
      "nameCn": "回液",
      "nameEn": "return",
      "synonyms": [
        "回液侧",
        "回水"
      ],
      "isClassWord": false,
      "status": "启用"
    },
    {
      "id": "term_progress",
      "nameCn": "进度",
      "nameEn": "progress",
      "synonyms": [
        "进度值"
      ],
      "isClassWord": false,
      "status": "启用"
    },
    {
      "id": "term_flow",
      "nameCn": "流量",
      "nameEn": "flow",
      "synonyms": [
        "流量值"
      ],
      "isClassWord": false,
      "status": "启用"
    },
    {
      "id": "term_pressure",
      "nameCn": "压差",
      "nameEn": "pressure",
      "synonyms": [
        "压差值",
        "压降"
      ],
      "isClassWord": false,
      "status": "启用"
    },
    {
      "id": "term_level",
      "nameCn": "等级",
      "nameEn": "level",
      "synonyms": [
        "级别"
      ],
      "isClassWord": false,
      "status": "启用"
    },
    {
      "id": "term_project",
      "nameCn": "项目",
      "nameEn": "project",
      "synonyms": [
        "工程项目"
      ],
      "isClassWord": false,
      "status": "启用"
    }
  ],
  "valueDomains": [
    {
      "id": "vd_varchar10",
      "code": "VD-VARCHAR10",
      "dataType": "varchar",
      "length": 10,
      "precision": 0,
      "status": "启用"
    },
    {
      "id": "vd_dec52",
      "code": "VD-DEC52",
      "dataType": "decimal",
      "length": 7,
      "precision": 2,
      "status": "启用"
    },
    {
      "id": "vd_dec51",
      "code": "VD-DEC51",
      "dataType": "decimal",
      "length": 6,
      "precision": 1,
      "status": "启用"
    },
    {
      "id": "vd_name",
      "code": "VD-NAME",
      "dataType": "varchar",
      "length": 64,
      "precision": 0,
      "status": "启用"
    },
    {
      "id": "vd_code",
      "code": "VD-CODE",
      "dataType": "varchar",
      "length": 32,
      "precision": 0,
      "status": "启用"
    },
    {
      "id": "vd_percent",
      "code": "VD-PERCENT",
      "dataType": "decimal",
      "length": 6,
      "precision": 2,
      "status": "启用"
    }
  ],
  "refDatas": [
    {
      "id": "rd_device_type",
      "code": "CK0001",
      "name": "液冷设备类型",
      "status": "启用",
      "values": [
        {
          "code": "01",
          "name": "CDU"
        },
        {
          "code": "02",
          "name": "Manifold"
        },
        {
          "code": "03",
          "name": "冷源"
        },
        {
          "code": "04",
          "name": "泵"
        }
      ]
    },
    {
      "id": "rd_cdu_model",
      "code": "CK0002",
      "name": "CDU 型号",
      "status": "启用",
      "values": [
        {
          "code": "01",
          "name": "SKY-ACMECOL-50"
        },
        {
          "code": "02",
          "name": "SKY-ACMECOL-100"
        },
        {
          "code": "03",
          "name": "SKY-ACMECOL-150"
        }
      ]
    },
    {
      "id": "rd_cooling_mode",
      "code": "CK0003",
      "name": "冷却方式",
      "status": "启用",
      "values": [
        {
          "code": "01",
          "name": "冷板式液冷"
        },
        {
          "code": "02",
          "name": "浸没式液冷"
        },
        {
          "code": "03",
          "name": "风冷"
        },
        {
          "code": "04",
          "name": "相变"
        }
      ]
    },
    {
      "id": "rd_coolant",
      "code": "CK0004",
      "name": "冷却液类型",
      "status": "启用",
      "values": [
        {
          "code": "01",
          "name": "去离子水"
        },
        {
          "code": "02",
          "name": "乙二醇溶液"
        },
        {
          "code": "03",
          "name": "氟化液"
        }
      ]
    },
    {
      "id": "rd_cold_source_type",
      "code": "CK0005",
      "name": "冷源类型",
      "status": "启用",
      "values": [
        {
          "code": "01",
          "name": "风冷冷源"
        },
        {
          "code": "02",
          "name": "水冷冷源"
        },
        {
          "code": "03",
          "name": "干冷器"
        }
      ]
    }
  ],
  "infoItems": [
    {
      "id": "ii_device_type",
      "code": "II0001",
      "nameCn": "设备类型编码",
      "nameEn": "device_type_code",
      "termIds": [
        "term_device",
        "term_type",
        "term_code"
      ],
      "valueDomainId": "vd_varchar10",
      "refDataId": "rd_device_type",
      "type": "业务",
      "bizDomainId": "bd_rnd",
      "definition": "液冷设备类型的标准编码",
      "securityLevel": "L2",
      "status": "启用"
    },
    {
      "id": "ii_power_consumption",
      "code": "II0002",
      "nameCn": "功耗值",
      "nameEn": "consumption_value",
      "termIds": [
        "term_consumption",
        "term_value"
      ],
      "valueDomainId": "vd_dec52",
      "refDataId": null,
      "type": "业务",
      "bizDomainId": "bd_ops",
      "definition": "液冷设备功耗的标准取值",
      "securityLevel": "L3",
      "status": "启用"
    },
    {
      "id": "ii_cdu_model",
      "code": "II0003",
      "nameCn": "冷量分配单元型号名称",
      "nameEn": "cdu_model_name",
      "termIds": [
        "term_cdu",
        "term_model",
        "term_name"
      ],
      "valueDomainId": "vd_name",
      "refDataId": "rd_cdu_model",
      "type": "业务",
      "bizDomainId": "bd_rnd",
      "definition": "冷量分配单元型号的标准名称",
      "securityLevel": "L2",
      "status": "启用"
    },
    {
      "id": "ii_cooling_mode",
      "code": "II0004",
      "nameCn": "冷却方式名称",
      "nameEn": "cooling_mode_name",
      "termIds": [
        "term_cooling",
        "term_mode",
        "term_name"
      ],
      "valueDomainId": "vd_name",
      "refDataId": "rd_cooling_mode",
      "type": "业务",
      "bizDomainId": "bd_rnd",
      "definition": "液冷冷却方式的标准名称",
      "securityLevel": "L2",
      "status": "启用"
    },
    {
      "id": "ii_coolant_type",
      "code": "II0005",
      "nameCn": "冷却液类型编码",
      "nameEn": "coolant_type_code",
      "termIds": [
        "term_coolant",
        "term_type",
        "term_code"
      ],
      "valueDomainId": "vd_code",
      "refDataId": "rd_coolant",
      "type": "业务",
      "bizDomainId": "bd_rnd",
      "definition": "液冷冷却液类型的标准编码",
      "securityLevel": "L4",
      "status": "启用"
    },
    {
      "id": "ii_cold_source_type",
      "code": "II0006",
      "nameCn": "冷源类型名称",
      "nameEn": "cold_source_type_name",
      "termIds": [
        "term_cold_source",
        "term_type",
        "term_name"
      ],
      "valueDomainId": "vd_name",
      "refDataId": "rd_cold_source_type",
      "type": "业务",
      "bizDomainId": "bd_rnd",
      "definition": "冷源类型的标准名称",
      "securityLevel": "L3",
      "status": "启用"
    },
    {
      "id": "ii_efficiency_percent",
      "code": "II0007",
      "nameCn": "能效百分比",
      "nameEn": "efficiency_percent",
      "termIds": [
        "term_efficiency",
        "term_percent"
      ],
      "valueDomainId": "vd_percent",
      "refDataId": null,
      "type": "业务",
      "bizDomainId": "bd_ops",
      "definition": "液冷系统能效比的标准百分比",
      "securityLevel": "L2",
      "status": "启用"
    },
    {
      "id": "ii_supply_temp",
      "code": "II0008",
      "nameCn": "供液温度值",
      "nameEn": "supply_temperature_value",
      "termIds": [
        "term_supply",
        "term_temperature",
        "term_value"
      ],
      "valueDomainId": "vd_dec51",
      "refDataId": null,
      "type": "技术",
      "bizDomainId": null,
      "definition": null,
      "securityLevel": "L2",
      "status": "启用"
    },
    {
      "id": "ii_return_temp",
      "code": "II0009",
      "nameCn": "回液温度值",
      "nameEn": "return_temperature_value",
      "termIds": [
        "term_return",
        "term_temperature",
        "term_value"
      ],
      "valueDomainId": "vd_dec51",
      "refDataId": null,
      "type": "技术",
      "bizDomainId": null,
      "definition": null,
      "securityLevel": "L2",
      "status": "启用"
    },
    {
      "id": "ii_progress",
      "code": "II0010",
      "nameCn": "进度百分比",
      "nameEn": "progress_percent",
      "termIds": [
        "term_progress",
        "term_percent"
      ],
      "valueDomainId": "vd_percent",
      "refDataId": null,
      "type": "业务",
      "bizDomainId": "bd_pm",
      "definition": "实施进度的标准百分比",
      "securityLevel": "L2",
      "status": "启用"
    }
  ],
  "qualityRules": [
    {
      "id": "qr_001",
      "name": "供液温度取值范围",
      "type": "准确性",
      "targetFieldId": "f_tel_supply_temp",
      "expr": "20 <= supply_temp <= 45",
      "threshold": "100%",
      "severity": "严重",
      "status": "启用"
    },
    {
      "id": "qr_002",
      "name": "回液温度取值越界",
      "type": "准确性",
      "targetFieldId": "f_tel_return_temp",
      "expr": "20 <= return_temp <= 50",
      "threshold": "100%",
      "severity": "严重",
      "status": "启用"
    },
    {
      "id": "qr_003",
      "name": "遥测流量完整性",
      "type": "完整性",
      "targetFieldId": "f_tel_flow",
      "expr": "流量字段非空率 >= 95%",
      "threshold": "95%",
      "severity": "警告",
      "status": "启用"
    },
    {
      "id": "qr_004",
      "name": "供回液压差异常（泄漏预警）",
      "type": "一致性",
      "targetFieldId": "f_tel_pressure",
      "expr": "压差与设定值偏差 <= 5kPa",
      "threshold": "100%",
      "severity": "严重",
      "status": "启用"
    },
    {
      "id": "qr_005",
      "name": "供回液温差一致性",
      "type": "一致性",
      "targetFieldId": "f_tel_supply_temp",
      "expr": "供回液温差 <= 10℃",
      "threshold": "100%",
      "severity": "警告",
      "status": "启用"
    },
    {
      "id": "qr_006",
      "name": "质检记录完整性",
      "type": "完整性",
      "targetFieldId": "f_insp_item",
      "expr": "质检项非空率 = 100%",
      "threshold": "100%",
      "severity": "警告",
      "status": "启用"
    },
    {
      "id": "qr_007",
      "name": "PUE 阈值",
      "type": "准确性",
      "targetFieldId": "f_energy_pue",
      "expr": "1.0 <= pue <= 1.5",
      "threshold": "100%",
      "severity": "严重",
      "status": "启用"
    },
    {
      "id": "qr_008",
      "name": "订单交期准确性",
      "type": "准确性",
      "targetFieldId": "f_order_delivery",
      "expr": "交期日期非空率 = 100%",
      "threshold": "100%",
      "severity": "提示",
      "status": "启用"
    }
  ],
  "tables": [
    {
      "id": "t_device",
      "appId": "app_plm",
      "dbId": "db_plm",
      "nameCn": "液冷设备档案表",
      "nameEn": "liquid_cooling_device",
      "tableType": "业务表",
      "bizDomainId": "bd_rnd",
      "subjectId": "bs_device",
      "masterDataId": "md_cdu",
      "desc": "液冷设备（CDU/冷源）型号、制冷量与冷却液等设备参数",
      "partitions": null,
      "indexes": [
        {
          "name": "pk_liquid_cooling_device",
          "fields": [
            "MD_ID"
          ],
          "type": "主键",
          "unique": true
        },
        {
          "name": "idx_device_type",
          "fields": [
            "DEVICE_TYPE"
          ],
          "type": "普通",
          "unique": false
        },
        {
          "name": "idx_device_model",
          "fields": [
            "cdu_model_name"
          ],
          "type": "普通",
          "unique": false
        }
      ],
      "history": [
        {
          "version": "v1.0",
          "time": "2024-03-01",
          "operator": "研发设计组",
          "action": "新建",
          "desc": "建表并登记液冷设备档案元数据"
        },
        {
          "version": "v1.1",
          "time": "2025-01-20",
          "operator": "数据治理组",
          "action": "变更",
          "desc": "主数据编码字段改为引用液冷设备主数据"
        }
      ]
    },
    {
      "id": "t_bom",
      "appId": "app_plm",
      "dbId": "db_plm",
      "nameCn": "物料清单表",
      "nameEn": "bill_of_material",
      "tableType": "业务表",
      "bizDomainId": "bd_rnd",
      "subjectId": "bs_bom",
      "masterDataId": null,
      "desc": "BOM 物料编码、名称、数量与单位",
      "partitions": null,
      "indexes": [
        {
          "name": "pk_bill_of_material",
          "fields": [
            "BOM_CODE"
          ],
          "type": "主键",
          "unique": true
        },
        {
          "name": "idx_bom_project",
          "fields": [
            "PROJECT_ID"
          ],
          "type": "普通",
          "unique": false
        },
        {
          "name": "idx_bom_name",
          "fields": [
            "BOM_NAME"
          ],
          "type": "普通",
          "unique": false
        }
      ],
      "history": [
        {
          "version": "v1.0",
          "time": "2024-02-10",
          "operator": "数据治理组",
          "action": "新建",
          "desc": "建表并登记 BOM 物料清单元数据"
        },
        {
          "version": "v1.1",
          "time": "2024-11-05",
          "operator": "研发设计组",
          "action": "变更",
          "desc": "补充物料数量字段"
        }
      ]
    },
    {
      "id": "t_process",
      "appId": "app_plm",
      "dbId": "db_plm",
      "nameCn": "工艺参数表",
      "nameEn": "process_parameter",
      "tableType": "业务表",
      "bizDomainId": "bd_rnd",
      "subjectId": "bs_process",
      "masterDataId": null,
      "desc": "供液温度设定、流量与压差等核心工艺参数（涉密）",
      "partitions": null,
      "indexes": [
        {
          "name": "pk_process_parameter",
          "fields": [
            "PROCESS_CODE"
          ],
          "type": "主键",
          "unique": true
        },
        {
          "name": "idx_process_supply",
          "fields": [
            "SUPPLY_TEMP_SET"
          ],
          "type": "普通",
          "unique": false
        },
        {
          "name": "idx_process_flow",
          "fields": [
            "FLOW_SET"
          ],
          "type": "普通",
          "unique": false
        }
      ],
      "history": [
        {
          "version": "v1.0",
          "time": "2024-01-18",
          "operator": "数据治理组",
          "action": "新建",
          "desc": "建表并登记工艺参数元数据（涉密 L4）"
        },
        {
          "version": "v1.1",
          "time": "2025-04-12",
          "operator": "研发设计组",
          "action": "变更",
          "desc": "供液温度设定字段关联温度信息项标准"
        }
      ]
    },
    {
      "id": "t_order",
      "appId": "app_mes",
      "dbId": "db_mes",
      "nameCn": "生产订单表",
      "nameEn": "production_order",
      "tableType": "业务表",
      "bizDomainId": "bd_mes",
      "subjectId": "bs_order",
      "masterDataId": "md_project",
      "desc": "生产订单编号、数量与交期",
      "partitions": null,
      "indexes": [
        {
          "name": "pk_production_order",
          "fields": [
            "ORDER_CODE"
          ],
          "type": "主键",
          "unique": true
        },
        {
          "name": "idx_order_customer",
          "fields": [
            "CUSTOMER_ID"
          ],
          "type": "普通",
          "unique": false
        },
        {
          "name": "idx_order_project",
          "fields": [
            "PROJECT_ID"
          ],
          "type": "普通",
          "unique": false
        }
      ],
      "history": [
        {
          "version": "v1.0",
          "time": "2024-04-02",
          "operator": "生产制造组",
          "action": "新建",
          "desc": "建表并登记生产订单元数据"
        },
        {
          "version": "v1.1",
          "time": "2025-05-10",
          "operator": "数据治理组",
          "action": "变更",
          "desc": "交期字段关联质量规则 qr_008"
        }
      ]
    },
    {
      "id": "t_inspection",
      "appId": "app_mes",
      "dbId": "db_mes",
      "nameCn": "质检记录表",
      "nameEn": "inspection_record",
      "tableType": "业务表",
      "bizDomainId": "bd_mes",
      "subjectId": "bs_inspection",
      "masterDataId": null,
      "desc": "质检项、质检结果与质检日期",
      "partitions": null,
      "indexes": [
        {
          "name": "pk_inspection_record",
          "fields": [
            "INSPECTION_ITEM"
          ],
          "type": "主键",
          "unique": true
        },
        {
          "name": "idx_inspection_order",
          "fields": [
            "ORDER_CODE"
          ],
          "type": "普通",
          "unique": false
        },
        {
          "name": "idx_inspection_project",
          "fields": [
            "PROJECT_ID"
          ],
          "type": "普通",
          "unique": false
        }
      ],
      "history": [
        {
          "version": "v1.0",
          "time": "2024-05-06",
          "operator": "生产制造组",
          "action": "新建",
          "desc": "建表并登记质检记录元数据"
        },
        {
          "version": "v1.1",
          "time": "2025-02-14",
          "operator": "数据治理组",
          "action": "调整",
          "desc": "质检项字段关联质量规则 qr_006"
        }
      ]
    },
    {
      "id": "t_project",
      "appId": "app_crm",
      "dbId": "db_crm",
      "nameCn": "液冷项目表",
      "nameEn": "liquid_cooling_project",
      "tableType": "业务表",
      "bizDomainId": "bd_crm",
      "subjectId": "bs_project",
      "masterDataId": "md_project",
      "desc": "项目编号、客户与交付时间",
      "partitions": null,
      "indexes": [
        {
          "name": "pk_liquid_cooling_project",
          "fields": [
            "PROJECT_CODE"
          ],
          "type": "主键",
          "unique": true
        },
        {
          "name": "idx_project_customer",
          "fields": [
            "CUSTOMER_ID"
          ],
          "type": "普通",
          "unique": false
        },
        {
          "name": "idx_project_contract",
          "fields": [
            "CONTRACT_AMOUNT"
          ],
          "type": "普通",
          "unique": false
        }
      ],
      "history": [
        {
          "version": "v1.0",
          "time": "2024-04-02",
          "operator": "营销服务组",
          "action": "新建",
          "desc": "建表并登记液冷项目元数据"
        },
        {
          "version": "v1.1",
          "time": "2025-05-10",
          "operator": "数据治理组",
          "action": "变更",
          "desc": "客户字段补充数据中心客户主数据引用"
        }
      ]
    },
    {
      "id": "t_commissioning",
      "appId": "app_pm",
      "dbId": "db_pm",
      "nameCn": "调试实施记录表",
      "nameEn": "commissioning_record",
      "tableType": "业务表",
      "bizDomainId": "bd_pm",
      "subjectId": "bs_commissioning",
      "masterDataId": "md_project",
      "desc": "调试工单、调试项与实施进度记录",
      "partitions": [
        {
          "field": "COMM_CODE",
          "type": "HASH",
          "granularity": "日",
          "count": 8,
          "desc": "按调试工单哈希分片，支撑每日调试实施高频写入"
        }
      ],
      "indexes": [
        {
          "name": "pk_commissioning_record",
          "fields": [
            "COMM_CODE"
          ],
          "type": "主键",
          "unique": true
        },
        {
          "name": "idx_comm_project",
          "fields": [
            "PROJECT_ID"
          ],
          "type": "普通",
          "unique": false
        },
        {
          "name": "idx_comm_progress",
          "fields": [
            "progress_percent"
          ],
          "type": "普通",
          "unique": false
        }
      ],
      "history": [
        {
          "version": "v1.0",
          "time": "2024-05-06",
          "operator": "集成实施组",
          "action": "新建",
          "desc": "建表并登记调试实施记录元数据"
        },
        {
          "version": "v1.1",
          "time": "2025-02-14",
          "operator": "数据治理组",
          "action": "调整",
          "desc": "进度百分比字段贯标 progress_percent 标准"
        }
      ]
    },
    {
      "id": "t_telemetry",
      "appId": "app_dcim",
      "dbId": "db_dcim",
      "nameCn": "运行遥测表",
      "nameEn": "operation_telemetry",
      "tableType": "技术表",
      "bizDomainId": "bd_ops",
      "subjectId": "bs_telemetry",
      "masterDataId": null,
      "desc": "液冷运行遥测数据（供回液温度/流量/压差/功耗）",
      "partitions": [
        {
          "field": "TS",
          "type": "RANGE",
          "granularity": "日",
          "count": 365,
          "desc": "按时间戳日分区，保留近一年运行遥测明细"
        },
        {
          "field": "TS",
          "type": "RANGE",
          "granularity": "月",
          "count": 12,
          "desc": "按时间戳月分区，用于遥测历史归档"
        }
      ],
      "indexes": [
        {
          "name": "pk_operation_telemetry",
          "fields": [
            "TS"
          ],
          "type": "主键",
          "unique": true
        },
        {
          "name": "idx_tel_supply",
          "fields": [
            "supply_temperature_value"
          ],
          "type": "普通",
          "unique": false
        },
        {
          "name": "idx_tel_power",
          "fields": [
            "consumption_value"
          ],
          "type": "普通",
          "unique": false
        }
      ],
      "history": [
        {
          "version": "v1.0",
          "time": "2024-06-01",
          "operator": "智慧运维组",
          "action": "新建",
          "desc": "建表并登记运行遥测元数据"
        },
        {
          "version": "v1.1",
          "time": "2025-07-15",
          "operator": "数据治理组",
          "action": "变更",
          "desc": "供液温度字段贯标 supply_temperature_value 标准"
        }
      ]
    },
    {
      "id": "t_alarm",
      "appId": "app_dcim",
      "dbId": "db_dcim",
      "nameCn": "告警记录表",
      "nameEn": "alarm_record",
      "tableType": "业务表",
      "bizDomainId": "bd_ops",
      "subjectId": "bs_alarm",
      "masterDataId": null,
      "desc": "告警级别、类型与时间（漏液/超温/超压）",
      "partitions": [
        {
          "field": "ALARM_TIME",
          "type": "RANGE",
          "granularity": "日",
          "count": 365,
          "desc": "按告警时间日分区，保留近一年告警明细"
        },
        {
          "field": "ALARM_TIME",
          "type": "RANGE",
          "granularity": "月",
          "count": 12,
          "desc": "按告警时间月分区，用于历史归档"
        }
      ],
      "indexes": [
        {
          "name": "pk_alarm_record",
          "fields": [
            "ALARM_CODE"
          ],
          "type": "主键",
          "unique": true
        },
        {
          "name": "idx_alarm_device",
          "fields": [
            "DEVICE_ID"
          ],
          "type": "普通",
          "unique": false
        },
        {
          "name": "idx_alarm_level",
          "fields": [
            "ALARM_LEVEL"
          ],
          "type": "普通",
          "unique": false
        }
      ],
      "history": [
        {
          "version": "v1.0",
          "time": "2024-06-15",
          "operator": "智慧运维组",
          "action": "新建",
          "desc": "建表并登记告警记录元数据"
        },
        {
          "version": "v1.1",
          "time": "2025-08-01",
          "operator": "数据治理组",
          "action": "变更",
          "desc": "告警类型字段补充漏液/超温/超压枚举"
        }
      ]
    },
    {
      "id": "t_energy",
      "appId": "app_dcim",
      "dbId": "db_dcim",
      "nameCn": "能耗 PUE 表",
      "nameEn": "energy_pue",
      "tableType": "业务表",
      "bizDomainId": "bd_ops",
      "subjectId": "bs_energy",
      "masterDataId": null,
      "desc": "实时/日均 PUE 与能耗",
      "partitions": [
        {
          "field": "TS",
          "type": "RANGE",
          "granularity": "日",
          "count": 365,
          "desc": "按时间戳日分区，保留近一年能耗明细"
        },
        {
          "field": "TS",
          "type": "RANGE",
          "granularity": "月",
          "count": 12,
          "desc": "按时间戳月分区，用于历史归档"
        }
      ],
      "indexes": [
        {
          "name": "pk_energy_pue",
          "fields": [
            "TS"
          ],
          "type": "主键",
          "unique": true
        },
        {
          "name": "idx_energy_project",
          "fields": [
            "PROJECT_ID"
          ],
          "type": "普通",
          "unique": false
        },
        {
          "name": "idx_energy_pue_value",
          "fields": [
            "efficiency_percent"
          ],
          "type": "普通",
          "unique": false
        }
      ],
      "history": [
        {
          "version": "v1.0",
          "time": "2024-07-05",
          "operator": "智慧运维组",
          "action": "新建",
          "desc": "建表并登记能耗 PUE 元数据"
        },
        {
          "version": "v1.1",
          "time": "2025-04-28",
          "operator": "数据治理组",
          "action": "调整",
          "desc": "PUE 字段关联质量规则 qr_007"
        }
      ]
    }
  ],
  "fields": [
    {
      "id": "f_dev_model",
      "tableId": "t_device",
      "seq": 1,
      "business": {
        "code": "cdu_model_name",
        "nameCn": "冷量分配单元型号名称",
        "definition": "CDU 冷量分配单元型号",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "varchar(32)",
        "length": 32,
        "isPK": false,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": "ii_cdu_model",
        "securityLevel": "L2",
        "owner": "研发设计组",
        "updateFrequency": "静态",
        "securityCatalogId": "sc_003"
      }
    },
    {
      "id": "f_dev_md",
      "tableId": "t_device",
      "seq": 2,
      "business": {
        "code": "MD_ID",
        "nameCn": "主数据编码",
        "definition": "主数据编码",
        "masterDataId": "md_cdu",
        "masterDataType": "液冷设备"
      },
      "technical": {
        "type": "varchar(32)",
        "length": 32,
        "isPK": true,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L2",
        "owner": "研发设计组",
        "updateFrequency": "静态"
      }
    },
    {
      "id": "f_dev_type",
      "tableId": "t_device",
      "seq": 3,
      "business": {
        "code": "DEVICE_TYPE",
        "nameCn": "设备类型",
        "definition": "液冷设备类型（CDU/Manifold/冷源/泵）",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "varchar(10)",
        "length": 10,
        "isPK": false,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": "ii_device_type",
        "securityLevel": "L3",
        "owner": "研发设计组",
        "updateFrequency": "静态",
        "securityCatalogId": "sc_007"
      }
    },
    {
      "id": "f_dev_capacity",
      "tableId": "t_device",
      "seq": 4,
      "business": {
        "code": "COOLING_CAPACITY",
        "nameCn": "制冷量",
        "definition": "液冷设备制冷量（kW）",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "decimal(6,1)",
        "length": 7,
        "isPK": false,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L2",
        "owner": "研发设计组",
        "updateFrequency": "静态",
        "securityCatalogId": "sc_003"
      }
    },
    {
      "id": "f_dev_coolant_type",
      "tableId": "t_device",
      "seq": 5,
      "business": {
        "code": "COOLANT_TYPE",
        "nameCn": "冷却液类型",
        "definition": "冷却液类型（去离子水/乙二醇/氟化液）",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "varchar(20)",
        "length": 20,
        "isPK": false,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": "ii_coolant_type",
        "securityLevel": "L4",
        "owner": "研发设计组",
        "updateFrequency": "静态",
        "securityCatalogId": "sc_005"
      }
    },
    {
      "id": "f_bom_code",
      "tableId": "t_bom",
      "seq": 1,
      "business": {
        "code": "BOM_CODE",
        "nameCn": "物料编码",
        "definition": "BOM 物料编码",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "varchar(32)",
        "length": 32,
        "isPK": true,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L3",
        "owner": "研发设计组",
        "updateFrequency": "静态",
        "securityCatalogId": "sc_004"
      }
    },
    {
      "id": "f_bom_name",
      "tableId": "t_bom",
      "seq": 2,
      "business": {
        "code": "BOM_NAME",
        "nameCn": "物料名称",
        "definition": "BOM 物料名称",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "varchar(64)",
        "length": 64,
        "isPK": false,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L3",
        "owner": "研发设计组",
        "updateFrequency": "静态",
        "securityCatalogId": "sc_004"
      }
    },
    {
      "id": "f_bom_qty",
      "tableId": "t_bom",
      "seq": 3,
      "business": {
        "code": "QTY",
        "nameCn": "数量",
        "definition": "BOM 物料数量",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "int",
        "length": 4,
        "isPK": false,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L3",
        "owner": "研发设计组",
        "updateFrequency": "静态",
        "securityCatalogId": "sc_004"
      }
    },
    {
      "id": "f_bom_unit",
      "tableId": "t_bom",
      "seq": 4,
      "business": {
        "code": "UNIT",
        "nameCn": "单位",
        "definition": "BOM 物料计量单位",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "varchar(10)",
        "length": 10,
        "isPK": false,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L3",
        "owner": "研发设计组",
        "updateFrequency": "静态",
        "securityCatalogId": "sc_004"
      }
    },
    {
      "id": "f_bom_project",
      "tableId": "t_bom",
      "seq": 5,
      "business": {
        "code": "PROJECT_ID",
        "nameCn": "所属项目",
        "definition": "物料所属液冷项目",
        "masterDataId": "md_project",
        "masterDataType": "液冷项目"
      },
      "technical": {
        "type": "varchar(32)",
        "length": 32,
        "isPK": false,
        "isFK": true,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L2",
        "owner": "研发设计组",
        "updateFrequency": "静态"
      }
    },
    {
      "id": "f_proc_code",
      "tableId": "t_process",
      "seq": 1,
      "business": {
        "code": "PROCESS_CODE",
        "nameCn": "工艺编号",
        "definition": "工艺参数编号",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "varchar(32)",
        "length": 32,
        "isPK": true,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L4",
        "owner": "研发设计组",
        "updateFrequency": "静态",
        "securityCatalogId": "sc_005"
      }
    },
    {
      "id": "f_proc_supply_temp",
      "tableId": "t_process",
      "seq": 2,
      "business": {
        "code": "SUPPLY_TEMP_SET",
        "nameCn": "供液温度设定",
        "definition": "供液温度设定值（℃）",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "decimal(5,1)",
        "length": 6,
        "isPK": false,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": "ii_supply_temp",
        "securityLevel": "L4",
        "owner": "研发设计组",
        "updateFrequency": "静态",
        "securityCatalogId": "sc_005"
      }
    },
    {
      "id": "f_proc_flow",
      "tableId": "t_process",
      "seq": 3,
      "business": {
        "code": "FLOW_SET",
        "nameCn": "流量设定",
        "definition": "流量设定值（L/min）",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "decimal(6,1)",
        "length": 7,
        "isPK": false,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L4",
        "owner": "研发设计组",
        "updateFrequency": "静态",
        "securityCatalogId": "sc_005"
      }
    },
    {
      "id": "f_proc_pressure",
      "tableId": "t_process",
      "seq": 4,
      "business": {
        "code": "PRESSURE_SET",
        "nameCn": "压差设定",
        "definition": "压差设定值（kPa）",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "decimal(6,1)",
        "length": 7,
        "isPK": false,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L4",
        "owner": "研发设计组",
        "updateFrequency": "静态",
        "securityCatalogId": "sc_005"
      }
    },
    {
      "id": "f_proc_return_temp",
      "tableId": "t_process",
      "seq": 5,
      "business": {
        "code": "RETURN_TEMP_SET",
        "nameCn": "回液温度设定",
        "definition": "回液温度设定值（℃）",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "decimal(5,1)",
        "length": 6,
        "isPK": false,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": "ii_return_temp",
        "securityLevel": "L4",
        "owner": "研发设计组",
        "updateFrequency": "静态",
        "securityCatalogId": "sc_005"
      }
    },
    {
      "id": "f_order_code",
      "tableId": "t_order",
      "seq": 1,
      "business": {
        "code": "ORDER_CODE",
        "nameCn": "订单编号",
        "definition": "生产订单编号",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "varchar(32)",
        "length": 32,
        "isPK": true,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L2",
        "owner": "生产制造组",
        "updateFrequency": "每日",
        "securityCatalogId": "sc_009"
      }
    },
    {
      "id": "f_order_qty",
      "tableId": "t_order",
      "seq": 2,
      "business": {
        "code": "QTY",
        "nameCn": "数量",
        "definition": "生产订单数量",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "int",
        "length": 4,
        "isPK": false,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L2",
        "owner": "生产制造组",
        "updateFrequency": "每日",
        "securityCatalogId": "sc_009"
      }
    },
    {
      "id": "f_order_delivery",
      "tableId": "t_order",
      "seq": 3,
      "business": {
        "code": "DELIVERY_DATE",
        "nameCn": "交期",
        "definition": "生产订单交期日期",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "date",
        "length": 0,
        "isPK": false,
        "isFK": false,
        "qualityRuleIds": [
          "qr_008"
        ]
      },
      "management": {
        "standardId": null,
        "securityLevel": "L2",
        "owner": "生产制造组",
        "updateFrequency": "每日",
        "securityCatalogId": "sc_009"
      }
    },
    {
      "id": "f_order_customer",
      "tableId": "t_order",
      "seq": 4,
      "business": {
        "code": "CUSTOMER_ID",
        "nameCn": "客户",
        "definition": "订单所属数据中心客户",
        "masterDataId": "md_customer",
        "masterDataType": "数据中心客户"
      },
      "technical": {
        "type": "varchar(32)",
        "length": 32,
        "isPK": false,
        "isFK": true,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L2",
        "owner": "生产制造组",
        "updateFrequency": "每日"
      }
    },
    {
      "id": "f_order_project",
      "tableId": "t_order",
      "seq": 5,
      "business": {
        "code": "PROJECT_ID",
        "nameCn": "所属项目",
        "definition": "订单所属液冷项目",
        "masterDataId": "md_project",
        "masterDataType": "液冷项目"
      },
      "technical": {
        "type": "varchar(32)",
        "length": 32,
        "isPK": false,
        "isFK": true,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L2",
        "owner": "生产制造组",
        "updateFrequency": "每日"
      }
    },
    {
      "id": "f_insp_item",
      "tableId": "t_inspection",
      "seq": 1,
      "business": {
        "code": "INSPECTION_ITEM",
        "nameCn": "质检项",
        "definition": "质检项目",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "varchar(64)",
        "length": 64,
        "isPK": true,
        "isFK": false,
        "qualityRuleIds": [
          "qr_006"
        ]
      },
      "management": {
        "standardId": null,
        "securityLevel": "L2",
        "owner": "生产制造组",
        "updateFrequency": "每日",
        "securityCatalogId": "sc_009"
      }
    },
    {
      "id": "f_insp_result",
      "tableId": "t_inspection",
      "seq": 2,
      "business": {
        "code": "INSPECTION_RESULT",
        "nameCn": "质检结果",
        "definition": "质检结果（合格/不合格）",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "varchar(20)",
        "length": 20,
        "isPK": false,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L2",
        "owner": "生产制造组",
        "updateFrequency": "每日",
        "securityCatalogId": "sc_009"
      }
    },
    {
      "id": "f_insp_date",
      "tableId": "t_inspection",
      "seq": 3,
      "business": {
        "code": "INSPECTION_DATE",
        "nameCn": "质检日期",
        "definition": "质检日期",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "date",
        "length": 0,
        "isPK": false,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L2",
        "owner": "生产制造组",
        "updateFrequency": "每日",
        "securityCatalogId": "sc_009"
      }
    },
    {
      "id": "f_insp_order",
      "tableId": "t_inspection",
      "seq": 4,
      "business": {
        "code": "ORDER_CODE",
        "nameCn": "订单",
        "definition": "质检关联的生产订单",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "varchar(32)",
        "length": 32,
        "isPK": false,
        "isFK": true,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L2",
        "owner": "生产制造组",
        "updateFrequency": "每日"
      }
    },
    {
      "id": "f_insp_project",
      "tableId": "t_inspection",
      "seq": 5,
      "business": {
        "code": "PROJECT_ID",
        "nameCn": "所属项目",
        "definition": "质检记录所属液冷项目",
        "masterDataId": "md_project",
        "masterDataType": "液冷项目"
      },
      "technical": {
        "type": "varchar(32)",
        "length": 32,
        "isPK": false,
        "isFK": true,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L2",
        "owner": "生产制造组",
        "updateFrequency": "每日"
      }
    },
    {
      "id": "f_proj_code",
      "tableId": "t_project",
      "seq": 1,
      "business": {
        "code": "PROJECT_CODE",
        "nameCn": "项目编号",
        "definition": "液冷项目编号",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "varchar(32)",
        "length": 32,
        "isPK": true,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L2",
        "owner": "营销服务组",
        "updateFrequency": "静态",
        "securityCatalogId": "sc_001"
      }
    },
    {
      "id": "f_proj_name",
      "tableId": "t_project",
      "seq": 2,
      "business": {
        "code": "PROJECT_NAME",
        "nameCn": "项目名称",
        "definition": "液冷项目名称",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "varchar(64)",
        "length": 64,
        "isPK": false,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L2",
        "owner": "营销服务组",
        "updateFrequency": "静态",
        "securityCatalogId": "sc_001"
      }
    },
    {
      "id": "f_proj_customer",
      "tableId": "t_project",
      "seq": 3,
      "business": {
        "code": "CUSTOMER_ID",
        "nameCn": "客户",
        "definition": "项目所属数据中心客户",
        "masterDataId": "md_customer",
        "masterDataType": "数据中心客户"
      },
      "technical": {
        "type": "varchar(32)",
        "length": 32,
        "isPK": false,
        "isFK": true,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L2",
        "owner": "营销服务组",
        "updateFrequency": "静态"
      }
    },
    {
      "id": "f_proj_delivery",
      "tableId": "t_project",
      "seq": 4,
      "business": {
        "code": "DELIVERY_TIME",
        "nameCn": "交付时间",
        "definition": "液冷项目交付时间",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "datetime",
        "length": 0,
        "isPK": false,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L2",
        "owner": "营销服务组",
        "updateFrequency": "静态",
        "securityCatalogId": "sc_001"
      }
    },
    {
      "id": "f_proj_contract",
      "tableId": "t_project",
      "seq": 5,
      "business": {
        "code": "CONTRACT_AMOUNT",
        "nameCn": "合同额",
        "definition": "液冷项目合同金额（万元）",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "decimal(10,2)",
        "length": 12,
        "isPK": false,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L3",
        "owner": "营销服务组",
        "updateFrequency": "静态",
        "securityCatalogId": "sc_002"
      }
    },
    {
      "id": "f_comm_code",
      "tableId": "t_commissioning",
      "seq": 1,
      "business": {
        "code": "COMM_CODE",
        "nameCn": "工单号",
        "definition": "调试实施工单号",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "varchar(32)",
        "length": 32,
        "isPK": true,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L2",
        "owner": "集成实施组",
        "updateFrequency": "每日",
        "securityCatalogId": "sc_010"
      }
    },
    {
      "id": "f_comm_item",
      "tableId": "t_commissioning",
      "seq": 2,
      "business": {
        "code": "COMM_ITEM",
        "nameCn": "调试项",
        "definition": "调试实施项目",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "varchar(64)",
        "length": 64,
        "isPK": false,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L2",
        "owner": "集成实施组",
        "updateFrequency": "每日",
        "securityCatalogId": "sc_010"
      }
    },
    {
      "id": "f_comm_result",
      "tableId": "t_commissioning",
      "seq": 3,
      "business": {
        "code": "COMM_RESULT",
        "nameCn": "调试结果",
        "definition": "调试结果（通过/未通过）",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "varchar(20)",
        "length": 20,
        "isPK": false,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L2",
        "owner": "集成实施组",
        "updateFrequency": "每日",
        "securityCatalogId": "sc_010"
      }
    },
    {
      "id": "f_comm_progress",
      "tableId": "t_commissioning",
      "seq": 4,
      "business": {
        "code": "progress_percent",
        "nameCn": "进度百分比",
        "definition": "调试实施进度百分比",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "tinyint",
        "length": 1,
        "isPK": false,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": "ii_progress",
        "securityLevel": "L2",
        "owner": "集成实施组",
        "updateFrequency": "每日",
        "securityCatalogId": "sc_010"
      }
    },
    {
      "id": "f_comm_project",
      "tableId": "t_commissioning",
      "seq": 5,
      "business": {
        "code": "PROJECT_ID",
        "nameCn": "所属项目",
        "definition": "调试实施所属液冷项目",
        "masterDataId": "md_project",
        "masterDataType": "液冷项目"
      },
      "technical": {
        "type": "varchar(32)",
        "length": 32,
        "isPK": false,
        "isFK": true,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L2",
        "owner": "集成实施组",
        "updateFrequency": "每日"
      }
    },
    {
      "id": "f_tel_supply_temp",
      "tableId": "t_telemetry",
      "seq": 1,
      "business": {
        "code": "supply_temperature_value",
        "nameCn": "供液温度值",
        "definition": "供液温度实测值（℃）",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "decimal(5,1)",
        "length": 6,
        "isPK": false,
        "isFK": false,
        "qualityRuleIds": [
          "qr_001",
          "qr_005"
        ]
      },
      "management": {
        "standardId": "ii_supply_temp",
        "securityLevel": "L3",
        "owner": "智慧运维组",
        "updateFrequency": "1分钟",
        "securityCatalogId": "sc_011"
      }
    },
    {
      "id": "f_tel_return_temp",
      "tableId": "t_telemetry",
      "seq": 2,
      "business": {
        "code": "return_temperature_value",
        "nameCn": "回液温度值",
        "definition": "回液温度实测值（℃）",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "decimal(5,1)",
        "length": 6,
        "isPK": false,
        "isFK": false,
        "qualityRuleIds": [
          "qr_002"
        ]
      },
      "management": {
        "standardId": "ii_return_temp",
        "securityLevel": "L3",
        "owner": "智慧运维组",
        "updateFrequency": "1分钟",
        "securityCatalogId": "sc_011"
      }
    },
    {
      "id": "f_tel_flow",
      "tableId": "t_telemetry",
      "seq": 3,
      "business": {
        "code": "FLOW",
        "nameCn": "流量",
        "definition": "冷却液流量实测值（L/min）",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "decimal(6,1)",
        "length": 7,
        "isPK": false,
        "isFK": false,
        "qualityRuleIds": [
          "qr_003"
        ]
      },
      "management": {
        "standardId": null,
        "securityLevel": "L3",
        "owner": "智慧运维组",
        "updateFrequency": "1分钟",
        "securityCatalogId": "sc_011"
      }
    },
    {
      "id": "f_tel_pressure",
      "tableId": "t_telemetry",
      "seq": 4,
      "business": {
        "code": "PRESSURE",
        "nameCn": "压差",
        "definition": "供回液压差实测值（kPa）",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "decimal(6,1)",
        "length": 7,
        "isPK": false,
        "isFK": false,
        "qualityRuleIds": [
          "qr_004"
        ]
      },
      "management": {
        "standardId": null,
        "securityLevel": "L3",
        "owner": "智慧运维组",
        "updateFrequency": "1分钟",
        "securityCatalogId": "sc_011"
      }
    },
    {
      "id": "f_tel_power",
      "tableId": "t_telemetry",
      "seq": 5,
      "business": {
        "code": "consumption_value",
        "nameCn": "功耗值",
        "definition": "液冷设备功耗（kW）",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "decimal(8,2)",
        "length": 10,
        "isPK": false,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": "ii_power_consumption",
        "securityLevel": "L3",
        "owner": "智慧运维组",
        "updateFrequency": "1分钟",
        "securityCatalogId": "sc_011"
      }
    },
    {
      "id": "f_tel_time",
      "tableId": "t_telemetry",
      "seq": 6,
      "business": {
        "code": "TS",
        "nameCn": "时间戳",
        "definition": "遥测采集时间戳",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "datetime",
        "length": 0,
        "isPK": true,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L3",
        "owner": "智慧运维组",
        "updateFrequency": "1分钟",
        "securityCatalogId": "sc_011"
      }
    },
    {
      "id": "f_alarm_code",
      "tableId": "t_alarm",
      "seq": 1,
      "business": {
        "code": "ALARM_CODE",
        "nameCn": "告警编号",
        "definition": "告警记录编号",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "varchar(32)",
        "length": 32,
        "isPK": true,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L2",
        "owner": "智慧运维组",
        "updateFrequency": "实时",
        "securityCatalogId": "sc_013"
      }
    },
    {
      "id": "f_alarm_level",
      "tableId": "t_alarm",
      "seq": 2,
      "business": {
        "code": "ALARM_LEVEL",
        "nameCn": "告警级别",
        "definition": "告警级别（提示/警告/严重）",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "varchar(10)",
        "length": 10,
        "isPK": false,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L2",
        "owner": "智慧运维组",
        "updateFrequency": "实时",
        "securityCatalogId": "sc_013"
      }
    },
    {
      "id": "f_alarm_type",
      "tableId": "t_alarm",
      "seq": 3,
      "business": {
        "code": "ALARM_TYPE",
        "nameCn": "告警类型",
        "definition": "告警类型（漏液/超温/超压）",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "varchar(20)",
        "length": 20,
        "isPK": false,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L2",
        "owner": "智慧运维组",
        "updateFrequency": "实时",
        "securityCatalogId": "sc_013"
      }
    },
    {
      "id": "f_alarm_time",
      "tableId": "t_alarm",
      "seq": 4,
      "business": {
        "code": "ALARM_TIME",
        "nameCn": "告警时间",
        "definition": "告警触发时间",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "datetime",
        "length": 0,
        "isPK": false,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L2",
        "owner": "智慧运维组",
        "updateFrequency": "实时",
        "securityCatalogId": "sc_013"
      }
    },
    {
      "id": "f_alarm_device",
      "tableId": "t_alarm",
      "seq": 5,
      "business": {
        "code": "DEVICE_ID",
        "nameCn": "设备",
        "definition": "告警关联的液冷设备",
        "masterDataId": "md_cdu",
        "masterDataType": "液冷设备"
      },
      "technical": {
        "type": "varchar(32)",
        "length": 32,
        "isPK": false,
        "isFK": true,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L2",
        "owner": "智慧运维组",
        "updateFrequency": "实时"
      }
    },
    {
      "id": "f_energy_time",
      "tableId": "t_energy",
      "seq": 1,
      "business": {
        "code": "TS",
        "nameCn": "时间戳",
        "definition": "能耗采集时间戳",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "datetime",
        "length": 0,
        "isPK": true,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L2",
        "owner": "智慧运维组",
        "updateFrequency": "15分钟",
        "securityCatalogId": "sc_012"
      }
    },
    {
      "id": "f_energy_pue",
      "tableId": "t_energy",
      "seq": 2,
      "business": {
        "code": "efficiency_percent",
        "nameCn": "能效百分比",
        "definition": "实时 PUE（电源使用效率）",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "decimal(4,2)",
        "length": 6,
        "isPK": false,
        "isFK": false,
        "qualityRuleIds": [
          "qr_007"
        ]
      },
      "management": {
        "standardId": "ii_efficiency_percent",
        "securityLevel": "L2",
        "owner": "智慧运维组",
        "updateFrequency": "15分钟",
        "securityCatalogId": "sc_012"
      }
    },
    {
      "id": "f_energy_daily_pue",
      "tableId": "t_energy",
      "seq": 3,
      "business": {
        "code": "DAILY_PUE",
        "nameCn": "日均PUE",
        "definition": "日均 PUE",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "decimal(4,2)",
        "length": 6,
        "isPK": false,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L2",
        "owner": "智慧运维组",
        "updateFrequency": "15分钟",
        "securityCatalogId": "sc_012"
      }
    },
    {
      "id": "f_energy_consumption",
      "tableId": "t_energy",
      "seq": 4,
      "business": {
        "code": "ENERGY_CONSUMPTION",
        "nameCn": "能耗",
        "definition": "液冷系统能耗（kWh）",
        "masterDataId": null,
        "masterDataType": null
      },
      "technical": {
        "type": "decimal(8,2)",
        "length": 10,
        "isPK": false,
        "isFK": false,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L2",
        "owner": "智慧运维组",
        "updateFrequency": "15分钟",
        "securityCatalogId": "sc_012"
      }
    },
    {
      "id": "f_energy_project",
      "tableId": "t_energy",
      "seq": 5,
      "business": {
        "code": "PROJECT_ID",
        "nameCn": "所属项目",
        "definition": "能耗数据所属液冷项目",
        "masterDataId": "md_project",
        "masterDataType": "液冷项目"
      },
      "technical": {
        "type": "varchar(32)",
        "length": 32,
        "isPK": false,
        "isFK": true,
        "qualityRuleIds": []
      },
      "management": {
        "standardId": null,
        "securityLevel": "L2",
        "owner": "智慧运维组",
        "updateFrequency": "15分钟"
      }
    }
  ],
  "qualityResults": [
    {
      "id": "qres_app_mes",
      "appId": "app_mes",
      "score": 92,
      "dimension": "完整性",
      "issues": [
        {
          "id": "issue_001",
          "fieldId": "f_insp_item",
          "ruleId": "qr_006",
          "desc": "2026-07 有 2 条质检记录缺质检项",
          "severity": "警告"
        }
      ]
    },
    {
      "id": "qres_app_dcim",
      "appId": "app_dcim",
      "score": 78,
      "dimension": "准确性",
      "issues": [
        {
          "id": "issue_002",
          "fieldId": "f_tel_supply_temp",
          "ruleId": "qr_001",
          "desc": "3 台 CDU 供液温度越界（>45℃）",
          "severity": "严重"
        }
      ]
    }
  ],
  "lineage": [
    {
      "id": "lg_001",
      "up": "t_device",
      "down": "t_telemetry",
      "relation": "采集配置",
      "mode": "数据服务",
      "desc": "液冷设备档案经实时数据服务同步为运行遥测采集配置",
      "fieldMapping": [
        {
          "up": "f_dev_md",
          "down": "f_tel_power"
        },
        {
          "up": "f_dev_model",
          "down": "f_tel_supply_temp"
        }
      ]
    },
    {
      "id": "lg_002",
      "up": "t_process",
      "down": "t_telemetry",
      "relation": "工艺参数比对",
      "mode": "数据服务",
      "desc": "工艺参数设定值经数据服务下发为遥测比对基准",
      "fieldMapping": [
        {
          "up": "f_proc_supply_temp",
          "down": "f_tel_supply_temp"
        },
        {
          "up": "f_proc_pressure",
          "down": "f_tel_pressure"
        }
      ]
    },
    {
      "id": "lg_003",
      "up": "t_telemetry",
      "down": "t_alarm",
      "relation": "告警触发",
      "mode": "应用内",
      "desc": "运维应用内实时脚本根据遥测超限触发告警",
      "fieldMapping": [
        {
          "up": "f_tel_supply_temp",
          "down": "f_alarm_time"
        },
        {
          "up": "f_tel_pressure",
          "down": "f_alarm_level"
        }
      ]
    },
    {
      "id": "lg_004",
      "up": "t_telemetry",
      "down": "t_energy",
      "relation": "能效计算",
      "mode": "应用内",
      "desc": "运维应用内定时脚本加工遥测功耗计算 PUE 能耗",
      "fieldMapping": [
        {
          "up": "f_tel_power",
          "down": "f_energy_pue"
        },
        {
          "up": "f_tel_time",
          "down": "f_energy_time"
        }
      ]
    },
    {
      "id": "lg_005",
      "up": "t_bom",
      "down": "t_order",
      "relation": "物料需求驱动",
      "mode": "离线批次",
      "desc": "BOM 物料清单离线批次下发驱动生产订单",
      "fieldMapping": [
        {
          "up": "f_bom_code",
          "down": "f_order_code"
        },
        {
          "up": "f_bom_project",
          "down": "f_order_project"
        }
      ]
    },
    {
      "id": "lg_006",
      "up": "t_order",
      "down": "t_inspection",
      "relation": "质检触发",
      "mode": "应用内",
      "desc": "制造应用内脚本根据生产订单触发质检记录",
      "fieldMapping": [
        {
          "up": "f_order_code",
          "down": "f_insp_order"
        },
        {
          "up": "f_order_project",
          "down": "f_insp_project"
        }
      ]
    },
    {
      "id": "lg_007",
      "up": "t_project",
      "down": "t_order",
      "relation": "项目订单关联",
      "mode": "离线批次",
      "desc": "液冷项目信息离线批次下发关联生产订单",
      "fieldMapping": [
        {
          "up": "f_proj_code",
          "down": "f_order_project"
        },
        {
          "up": "f_proj_customer",
          "down": "f_order_customer"
        }
      ]
    },
    {
      "id": "lg_008",
      "up": "t_project",
      "down": "t_commissioning",
      "relation": "实施任务关联",
      "mode": "离线批次",
      "desc": "液冷项目信息离线批次下发关联调试实施任务",
      "fieldMapping": [
        {
          "up": "f_proj_code",
          "down": "f_comm_project"
        },
        {
          "up": "f_proj_delivery",
          "down": "f_comm_result"
        }
      ]
    },
    {
      "id": "lg_009",
      "up": "t_commissioning",
      "down": "t_device",
      "relation": "设备档案回写",
      "mode": "离线批次",
      "desc": "调试实施结果离线批次回写更新设备档案制冷量",
      "fieldMapping": [
        {
          "up": "f_comm_result",
          "down": "f_dev_capacity"
        }
      ]
    }
  ],
  "batchFiles": [
    {
      "id": "bf_001",
      "name": "BOM 物料批次下发",
      "direction": "outbound",
      "sourceSystem": "研发设计系统",
      "sourceTableId": "t_bom",
      "sourceTableName": "物料清单表",
      "targetSystem": "生产制造系统·物料需求",
      "targetTableId": null,
      "targetTableName": "物料需求表",
      "fileFormat": "CSV",
      "schedule": "每日 02:00",
      "securityLevel": "L3",
      "status": "运行中",
      "applyFlow": [
        {
          "step": "申请",
          "actor": "研发设计组",
          "time": "2026-05-12",
          "result": "通过"
        },
        {
          "step": "安全合规审批",
          "actor": "数据安全组",
          "time": "2026-05-14",
          "result": "通过"
        },
        {
          "step": "授权",
          "actor": "平台管理员",
          "time": "2026-05-16",
          "result": "已授权"
        }
      ]
    },
    {
      "id": "bf_002",
      "name": "工艺参数批次下发",
      "direction": "outbound",
      "sourceSystem": "研发设计系统",
      "sourceTableId": "t_process",
      "sourceTableName": "工艺参数表",
      "targetSystem": "智慧运维系统·比对基准",
      "targetTableId": null,
      "targetTableName": "工艺基准参数表",
      "fileFormat": "JSON",
      "schedule": "每日 02:00",
      "securityLevel": "L4",
      "status": "运行中",
      "applyFlow": [
        {
          "step": "申请",
          "actor": "研发设计组",
          "time": "2026-05-11",
          "result": "通过"
        },
        {
          "step": "安全合规审批",
          "actor": "数据安全组",
          "time": "2026-05-13",
          "result": "通过"
        },
        {
          "step": "授权",
          "actor": "平台管理员",
          "time": "2026-05-15",
          "result": "已授权"
        }
      ]
    },
    {
      "id": "bf_003",
      "name": "设备档案批次同步",
      "direction": "outbound",
      "sourceSystem": "研发设计系统",
      "sourceTableId": "t_device",
      "sourceTableName": "液冷设备档案表",
      "targetSystem": "智慧运维系统·采集配置",
      "targetTableId": null,
      "targetTableName": "采集配置表",
      "fileFormat": "CSV",
      "schedule": "每周一 03:00",
      "securityLevel": "L3",
      "status": "运行中",
      "applyFlow": [
        {
          "step": "申请",
          "actor": "研发设计组",
          "time": "2026-05-10",
          "result": "通过"
        },
        {
          "step": "安全合规审批",
          "actor": "数据安全组",
          "time": "2026-05-12",
          "result": "通过"
        },
        {
          "step": "授权",
          "actor": "平台管理员",
          "time": "2026-05-14",
          "result": "已授权"
        }
      ]
    },
    {
      "id": "bf_004",
      "name": "质检报告批次交换",
      "direction": "outbound",
      "sourceSystem": "生产制造系统",
      "sourceTableId": "t_inspection",
      "sourceTableName": "质检记录表",
      "targetSystem": "客户协同平台",
      "targetTableId": null,
      "targetTableName": "质检报告表",
      "fileFormat": "CSV",
      "schedule": "每日 06:00",
      "securityLevel": "L2",
      "status": "运行中",
      "applyFlow": [
        {
          "step": "申请",
          "actor": "生产制造组",
          "time": "2026-05-09",
          "result": "通过"
        },
        {
          "step": "安全合规审批",
          "actor": "数据安全组",
          "time": "2026-05-11",
          "result": "通过"
        },
        {
          "step": "授权",
          "actor": "平台管理员",
          "time": "2026-05-13",
          "result": "已授权"
        }
      ]
    },
    {
      "id": "bf_005",
      "name": "订单对账批次交换",
      "direction": "outbound",
      "sourceSystem": "生产制造系统",
      "sourceTableId": "t_order",
      "sourceTableName": "生产订单表",
      "targetSystem": "供应商协同平台",
      "targetTableId": null,
      "targetTableName": "订单对账表",
      "fileFormat": "CSV",
      "schedule": "每月 1 日 02:00",
      "securityLevel": "L2",
      "status": "审批中",
      "applyFlow": [
        {
          "step": "申请",
          "actor": "生产制造组",
          "time": "2026-08-01",
          "result": "通过"
        },
        {
          "step": "安全合规审批",
          "actor": "数据安全组",
          "time": "2026-08-03",
          "result": "通过"
        }
      ]
    },
    {
      "id": "bf_006",
      "name": "运行遥测数据接入",
      "direction": "inbound",
      "sourceSystem": "IoT 采集系统",
      "sourceDatabaseName": "iot_telemetry_db",
      "sourceDatabaseType": "时序库",
      "targetSystem": "数据资产平台",
      "targetDatabaseId": "db_dcim",
      "targetDatabaseName": "运维监控库",
      "fileFormat": "JSON",
      "schedule": "每 1 分钟",
      "securityLevel": "L3",
      "status": "运行中",
      "applyFlow": [
        {
          "step": "申请",
          "actor": "智慧运维组",
          "time": "2026-05-20",
          "result": "通过"
        },
        {
          "step": "安全合规审批",
          "actor": "数据安全组",
          "time": "2026-05-22",
          "result": "通过"
        },
        {
          "step": "授权",
          "actor": "平台管理员",
          "time": "2026-05-24",
          "result": "已授权"
        }
      ]
    },
    {
      "id": "bf_007",
      "name": "设备档案数据接入",
      "direction": "inbound",
      "sourceSystem": "设备管理平台",
      "sourceDatabaseName": "device_db",
      "sourceDatabaseType": "PostgreSQL",
      "targetSystem": "数据资产平台",
      "targetDatabaseId": "db_plm",
      "targetDatabaseName": "研发设计库",
      "fileFormat": "JSON",
      "schedule": "每日 02:00",
      "securityLevel": "L2",
      "status": "运行中",
      "applyFlow": [
        {
          "step": "申请",
          "actor": "研发设计组",
          "time": "2026-05-19",
          "result": "通过"
        },
        {
          "step": "安全合规审批",
          "actor": "数据安全组",
          "time": "2026-05-21",
          "result": "通过"
        },
        {
          "step": "授权",
          "actor": "平台管理员",
          "time": "2026-05-23",
          "result": "已授权"
        }
      ]
    },
    {
      "id": "bf_008",
      "name": "能耗数据上报接入",
      "direction": "inbound",
      "sourceSystem": "能耗采集系统",
      "sourceDatabaseName": "energy_db",
      "sourceDatabaseType": "时序库",
      "targetSystem": "数据资产平台",
      "targetDatabaseId": "db_dcim",
      "targetDatabaseName": "运维监控库",
      "fileFormat": "JSON",
      "schedule": "每 15 分钟",
      "securityLevel": "L2",
      "status": "审批中",
      "applyFlow": [
        {
          "step": "申请",
          "actor": "智慧运维组",
          "time": "2026-08-01",
          "result": "通过"
        },
        {
          "step": "安全合规审批",
          "actor": "数据安全组",
          "time": "2026-08-03",
          "result": "通过"
        },
        {
          "step": "授权",
          "actor": "平台管理员",
          "time": "—",
          "result": "待审批"
        }
      ]
    }
  ],
  "prodMetadatas": [
    {
      "id": "pm_telemetry",
      "batchFileId": "bf_006",
      "sourceSystem": "IoT 采集系统",
      "databaseName": "iot_telemetry_db",
      "databaseType": "时序库",
      "targetDatabaseId": "db_dcim",
      "collectedAt": "2026-08-15 02:00",
      "tables": [
        {
          "nameEn": "operation_telemetry",
          "nameCn": "运行遥测表",
          "fields": [
            {
              "code": "TS",
              "nameCn": "时间戳",
              "type": "datetime"
            },
            {
              "code": "supply_temperature_value",
              "nameCn": "供液温度值",
              "type": "decimal(5,1)"
            },
            {
              "code": "return_temperature_value",
              "nameCn": "回液温度值",
              "type": "decimal(5,1)"
            },
            {
              "code": "FLOW",
              "nameCn": "流量",
              "type": "int"
            },
            {
              "code": "PRESSURE",
              "nameCn": "压差",
              "type": "decimal(6,1)"
            },
            {
              "code": "consumption_value",
              "nameCn": "功耗",
              "type": "decimal(10,2)"
            },
            {
              "code": "leak_status",
              "nameCn": "漏液状态",
              "type": "varchar(10)"
            }
          ]
        },
        {
          "nameEn": "sensor_raw",
          "nameCn": "传感器原始表",
          "fields": [
            {
              "code": "SENSOR_ID",
              "nameCn": "传感器编号",
              "type": "varchar(32)"
            },
            {
              "code": "RAW_VALUE",
              "nameCn": "原始读数",
              "type": "decimal(8,2)"
            },
            {
              "code": "RAW_TIME",
              "nameCn": "采集时间",
              "type": "datetime"
            }
          ]
        }
      ]
    },
    {
      "id": "pm_device",
      "batchFileId": "bf_007",
      "sourceSystem": "设备管理平台",
      "databaseName": "device_db",
      "databaseType": "PostgreSQL",
      "targetDatabaseId": "db_plm",
      "collectedAt": "2026-08-15 02:00",
      "tables": [
        {
          "nameEn": "liquid_cooling_device",
          "nameCn": "液冷设备档案表",
          "fields": [
            {
              "code": "MD_ID",
              "nameCn": "主数据编码",
              "type": "varchar(32)"
            },
            {
              "code": "cdu_model_name",
              "nameCn": "冷量分配单元型号名称",
              "type": "varchar(32)"
            },
            {
              "code": "DEVICE_TYPE",
              "nameCn": "设备类型",
              "type": "varchar(10)"
            },
            {
              "code": "COOLING_CAPACITY",
              "nameCn": "制冷量",
              "type": "decimal(6,1)"
            },
            {
              "code": "COOLANT_TYPE",
              "nameCn": "冷却液类型",
              "type": "varchar(20)"
            }
          ]
        },
        {
          "nameEn": "legacy_device",
          "nameCn": "历史设备表",
          "fields": [
            {
              "code": "LEGACY_ID",
              "nameCn": "历史编号",
              "type": "varchar(32)"
            },
            {
              "code": "LEGACY_NAME",
              "nameCn": "历史名称",
              "type": "varchar(64)"
            }
          ]
        }
      ]
    },
    {
      "id": "pm_energy",
      "batchFileId": "bf_008",
      "sourceSystem": "能耗采集系统",
      "databaseName": "energy_db",
      "databaseType": "时序库",
      "targetDatabaseId": "db_dcim",
      "collectedAt": "2026-08-15 02:00",
      "tables": [
        {
          "nameEn": "energy_pue",
          "nameCn": "能耗 PUE 表",
          "fields": [
            {
              "code": "TS",
              "nameCn": "时间戳",
              "type": "datetime"
            },
            {
              "code": "efficiency_percent",
              "nameCn": "能效比",
              "type": "decimal(4,2)"
            },
            {
              "code": "DAILY_PUE",
              "nameCn": "日均PUE",
              "type": "decimal(4,2)"
            },
            {
              "code": "ENERGY_CONSUMPTION",
              "nameCn": "能耗",
              "type": "decimal(8,2)"
            },
            {
              "code": "PROJECT_ID",
              "nameCn": "所属项目",
              "type": "varchar(32)"
            },
            {
              "code": "cooling_efficiency",
              "nameCn": "冷却效率",
              "type": "decimal(4,2)"
            }
          ]
        }
      ]
    }
  ],
  "services": [
    {
      "id": "svc_001",
      "name": "设备运行监控 API",
      "type": "API",
      "latency": "准实时",
      "tableIds": [
        "t_telemetry"
      ],
      "desc": "对外提供液冷设备运行遥测数据查询与统计",
      "securityLevel": "L2",
      "status": "已上架",
      "access": {
        "endpoint": "https://demo.intelab.cn/api/v1/device/monitor",
        "method": "POST",
        "params": [
          {
            "name": "deviceId",
            "type": "string",
            "required": true,
            "desc": "液冷设备编号"
          },
          {
            "name": "metric",
            "type": "string",
            "required": true,
            "desc": "指标：supply_temp / return_temp / flow / pressure / power"
          },
          {
            "name": "startTime",
            "type": "string",
            "required": true,
            "desc": "起始时间（ISO8601）"
          }
        ],
        "requestExample": "curl -X POST \"https://demo.intelab.cn/api/v1/device/monitor\" -H \"Content-Type: application/json\" -d '{\"deviceId\":\"CDU-001\",\"metric\":\"supply_temp\",\"startTime\":\"2026-08-01T00:00:00Z\"}'",
        "responseExample": "{ \"code\": 0, \"data\": [ { \"ts\": \"2026-08-01T10:00:00Z\", \"deviceId\": \"CDU-001\", \"supply_temp\": 36.5 } ] }",
        "rateLimit": "1000 次/分钟",
        "version": "v1.2"
      },
      "metrics": {
        "calls": 15620,
        "consumers": 3,
        "last24h": 1680
      },
      "applyFlow": [
        {
          "step": "申请",
          "actor": "智慧运维组",
          "time": "2026-05-12",
          "result": "通过"
        },
        {
          "step": "安全合规审批",
          "actor": "数据安全组",
          "time": "2026-05-14",
          "result": "通过"
        },
        {
          "step": "授权",
          "actor": "平台管理员",
          "time": "2026-05-16",
          "result": "已授权"
        }
      ]
    },
    {
      "id": "svc_002",
      "name": "遥测实时订阅",
      "type": "订阅",
      "latency": "实时",
      "tableIds": [
        "t_telemetry"
      ],
      "desc": "液冷运行遥测实时订阅推送",
      "securityLevel": "L2",
      "status": "已上架",
      "access": {
        "protocol": "MQTT",
        "endpoint": "mqtt://demo.intelab.cn:1883",
        "topic": "liquid-cooling/telemetry/{deviceId}",
        "qos": 1,
        "messageFormat": "JSON",
        "messageFields": [
          {
            "name": "deviceId",
            "type": "string",
            "desc": "液冷设备编号"
          },
          {
            "name": "supplyTemp",
            "type": "float",
            "desc": "供液温度（℃）"
          },
          {
            "name": "returnTemp",
            "type": "float",
            "desc": "回液温度（℃）"
          },
          {
            "name": "flow",
            "type": "float",
            "desc": "流量（L/min）"
          },
          {
            "name": "power",
            "type": "float",
            "desc": "功耗（kW）"
          },
          {
            "name": "ts",
            "type": "string",
            "desc": "采集时间戳"
          }
        ]
      },
      "metrics": {
        "calls": 528600,
        "consumers": 2,
        "last24h": 34560
      },
      "applyFlow": [
        {
          "step": "申请",
          "actor": "智慧运维组",
          "time": "2026-04-20",
          "result": "通过"
        },
        {
          "step": "安全合规审批",
          "actor": "数据安全组",
          "time": "2026-04-22",
          "result": "通过"
        },
        {
          "step": "授权",
          "actor": "平台管理员",
          "time": "2026-04-24",
          "result": "已授权"
        }
      ]
    },
    {
      "id": "svc_003",
      "name": "能效分析服务",
      "type": "API",
      "latency": "准实时",
      "tableIds": [
        "t_energy"
      ],
      "desc": "PUE 能耗数据对外 API 服务",
      "securityLevel": "L2",
      "status": "已上架",
      "access": {
        "endpoint": "https://demo.intelab.cn/api/v1/energy/pue",
        "method": "GET",
        "params": [
          {
            "name": "projectId",
            "type": "string",
            "required": true,
            "desc": "液冷项目编号"
          },
          {
            "name": "date",
            "type": "string",
            "required": false,
            "desc": "查询日期（YYYY-MM-DD）"
          }
        ],
        "requestExample": "curl \"https://demo.intelab.cn/api/v1/energy/pue?projectId=LC-001&date=2026-08-16\"",
        "responseExample": "{ \"code\": 0, \"data\": [ { \"ts\": \"2026-08-16T00:00:00Z\", \"pue\": 1.12 } ] }",
        "rateLimit": "500 次/分钟",
        "version": "v1.0"
      },
      "metrics": {
        "calls": 8740,
        "consumers": 3,
        "last24h": 620
      },
      "applyFlow": [
        {
          "step": "申请",
          "actor": "智慧运维组",
          "time": "2026-04-18",
          "result": "通过"
        },
        {
          "step": "安全合规审批",
          "actor": "数据安全组",
          "time": "2026-04-20",
          "result": "通过"
        },
        {
          "step": "授权",
          "actor": "平台管理员",
          "time": "2026-04-22",
          "result": "已授权"
        }
      ]
    },
    {
      "id": "svc_004",
      "name": "核心工艺参数共享",
      "type": "数据包",
      "latency": "准实时",
      "tableIds": [
        "t_process"
      ],
      "desc": "液冷核心工艺参数（涉密）数据共享",
      "securityLevel": "L4",
      "status": "已上架",
      "access": {
        "format": "CSV / Parquet",
        "downloadUrl": "https://demo.intelab.cn/api/v1/packages/process-param/download",
        "updateFreq": "按季度更新",
        "size": "860 MB",
        "partition": "按工艺编号分区"
      },
      "metrics": {
        "calls": 96,
        "consumers": 1,
        "last24h": 0
      },
      "applyFlow": [
        {
          "step": "申请",
          "actor": "研发设计组",
          "time": "2026-03-05",
          "result": "通过"
        },
        {
          "step": "安全合规审批",
          "actor": "数据安全组",
          "time": "2026-03-07",
          "result": "通过"
        },
        {
          "step": "二次审批",
          "actor": "合规委员会",
          "time": "2026-03-10",
          "result": "通过"
        },
        {
          "step": "授权",
          "actor": "平台管理员",
          "time": "2026-03-12",
          "result": "已授权"
        }
      ]
    },
    {
      "id": "svc_005",
      "name": "设备档案查询 API",
      "type": "API",
      "latency": "准实时",
      "tableIds": [
        "t_device"
      ],
      "desc": "液冷设备档案查询服务",
      "securityLevel": "L2",
      "status": "已上架",
      "access": {
        "endpoint": "https://demo.intelab.cn/api/v1/device/archive",
        "method": "GET",
        "params": [
          {
            "name": "model",
            "type": "string",
            "required": false,
            "desc": "设备型号（CDU 系列）"
          },
          {
            "name": "deviceType",
            "type": "string",
            "required": false,
            "desc": "设备类型：CDU / Manifold / 冷源 / 泵"
          }
        ],
        "requestExample": "curl \"https://demo.intelab.cn/api/v1/device/archive?deviceType=CDU\"",
        "responseExample": "{ \"code\": 0, \"data\": [ { \"model\": \"SKY-ACMECOL-100\", \"coolingCapacity\": 100.0 } ] }",
        "rateLimit": "800 次/分钟",
        "version": "v1.1"
      },
      "metrics": {
        "calls": 3120,
        "consumers": 2,
        "last24h": 128
      },
      "applyFlow": [
        {
          "step": "申请",
          "actor": "研发设计组",
          "time": "2026-04-10",
          "result": "通过"
        },
        {
          "step": "安全合规审批",
          "actor": "数据安全组",
          "time": "2026-04-12",
          "result": "通过"
        },
        {
          "step": "授权",
          "actor": "平台管理员",
          "time": "2026-04-14",
          "result": "已授权"
        }
      ]
    }
  ],
  "portalAssets": [
    {
      "id": "pa_001",
      "name": "液冷运行遥测数据集",
      "category": "运行监测",
      "desc": "液冷设备供回液温度/流量/压差/功耗运行遥测，用于运行监测与能效分析。",
      "dataOwner": "智慧运维室",
      "govSpecialist": "业务数据治理专员",
      "manager": "数据管理人员",
      "usageType": "下载",
      "securityLevel": "L3",
      "tableIds": [
        "t_telemetry"
      ],
      "serviceIds": [],
      "status": "已上架",
      "featured": true,
      "listedAt": "2026-07-01",
      "approval": [
        {
          "step": "发起上架",
          "actor": "数据管理人员",
          "action": "提交",
          "time": "2026-06-28",
          "comment": "业务方已同意共享"
        },
        {
          "step": "业务方审批",
          "actor": "业务数据治理专员",
          "action": "通过",
          "time": "2026-06-30",
          "comment": "同意共享"
        },
        {
          "step": "上架",
          "actor": "数据管理人员",
          "action": "上架",
          "time": "2026-07-01",
          "comment": ""
        }
      ]
    },
    {
      "id": "pa_002",
      "name": "设备运行监控 API",
      "category": "运行监测",
      "desc": "对外提供液冷设备运行遥测查询与统计的标准 API。",
      "dataOwner": "智慧运维室",
      "govSpecialist": "业务数据治理专员",
      "manager": "数据管理人员",
      "usageType": "申请",
      "securityLevel": "L2",
      "tableIds": [],
      "serviceIds": [
        "svc_001"
      ],
      "status": "已上架",
      "featured": false,
      "listedAt": "2026-07-02",
      "approval": [
        {
          "step": "发起上架",
          "actor": "数据管理人员",
          "action": "提交",
          "time": "2026-06-29",
          "comment": "业务方已同意共享"
        },
        {
          "step": "业务方审批",
          "actor": "业务数据治理专员",
          "action": "通过",
          "time": "2026-07-01",
          "comment": "同意共享"
        },
        {
          "step": "上架",
          "actor": "数据管理人员",
          "action": "上架",
          "time": "2026-07-02",
          "comment": ""
        }
      ]
    },
    {
      "id": "pa_003",
      "name": "核心工艺参数数据包",
      "category": "工艺标准",
      "desc": "液冷核心工艺参数（供液温度/流量/压差设定值）数据包（涉密，已获授权共享）。",
      "dataOwner": "研发设计室",
      "govSpecialist": "业务数据治理专员",
      "manager": "数据管理人员",
      "usageType": "下载",
      "securityLevel": "L4",
      "tableIds": [
        "t_process"
      ],
      "serviceIds": [],
      "status": "已上架",
      "featured": true,
      "listedAt": "2026-07-05",
      "approval": [
        {
          "step": "发起上架",
          "actor": "数据管理人员",
          "action": "提交",
          "time": "2026-07-02",
          "comment": "业务方已同意共享"
        },
        {
          "step": "业务方审批",
          "actor": "业务数据治理专员",
          "action": "通过",
          "time": "2026-07-04",
          "comment": "涉密数据，确认授权范围"
        },
        {
          "step": "上架",
          "actor": "数据管理人员",
          "action": "上架",
          "time": "2026-07-05",
          "comment": ""
        }
      ]
    },
    {
      "id": "pa_004",
      "name": "BOM 物料数据集",
      "category": "工艺标准",
      "desc": "液冷设备 BOM 物料清单编码、名称与数量。",
      "dataOwner": "研发设计室",
      "govSpecialist": "业务数据治理专员",
      "manager": "数据管理人员",
      "usageType": "下载",
      "securityLevel": "L3",
      "tableIds": [
        "t_bom"
      ],
      "serviceIds": [],
      "status": "已上架",
      "featured": false,
      "listedAt": "2026-07-06",
      "approval": [
        {
          "step": "发起上架",
          "actor": "数据管理人员",
          "action": "提交",
          "time": "2026-07-03",
          "comment": "业务方已同意共享"
        },
        {
          "step": "业务方审批",
          "actor": "业务数据治理专员",
          "action": "通过",
          "time": "2026-07-05",
          "comment": "同意共享"
        },
        {
          "step": "上架",
          "actor": "数据管理人员",
          "action": "上架",
          "time": "2026-07-06",
          "comment": ""
        }
      ]
    },
    {
      "id": "pa_005",
      "name": "液冷遥测实时订阅",
      "category": "运行监测",
      "desc": "液冷运行遥测实时订阅（供回液温度/流量/压差/功耗）与运行监测。",
      "dataOwner": "智慧运维室",
      "govSpecialist": "业务数据治理专员",
      "manager": "数据管理人员",
      "usageType": "申请",
      "securityLevel": "L3",
      "tableIds": [
        "t_telemetry"
      ],
      "serviceIds": [
        "svc_002"
      ],
      "status": "已上架",
      "featured": true,
      "listedAt": "2026-07-08",
      "approval": [
        {
          "step": "发起上架",
          "actor": "数据管理人员",
          "action": "提交",
          "time": "2026-07-06",
          "comment": "业务方已同意共享"
        },
        {
          "step": "业务方审批",
          "actor": "业务数据治理专员",
          "action": "通过",
          "time": "2026-07-07",
          "comment": "同意共享"
        },
        {
          "step": "上架",
          "actor": "数据管理人员",
          "action": "上架",
          "time": "2026-07-08",
          "comment": ""
        }
      ]
    },
    {
      "id": "pa_006",
      "name": "液冷设备档案数据产品",
      "category": "液冷设备",
      "desc": "液冷设备型号、制冷量与冷却液类型等设备档案数据产品（含涉密冷却液配方）。",
      "dataOwner": "研发设计室",
      "govSpecialist": "业务数据治理专员",
      "manager": "数据管理人员",
      "usageType": "下载",
      "securityLevel": "L4",
      "tableIds": [
        "t_device"
      ],
      "serviceIds": [
        "svc_005"
      ],
      "status": "已上架",
      "featured": false,
      "listedAt": "2026-07-10",
      "approval": [
        {
          "step": "发起上架",
          "actor": "数据管理人员",
          "action": "提交",
          "time": "2026-07-08",
          "comment": "业务方已同意共享"
        },
        {
          "step": "业务方审批",
          "actor": "业务数据治理专员",
          "action": "通过",
          "time": "2026-07-09",
          "comment": "涉密数据，确认授权范围"
        },
        {
          "step": "上架",
          "actor": "数据管理人员",
          "action": "上架",
          "time": "2026-07-10",
          "comment": ""
        }
      ]
    },
    {
      "id": "pa_007",
      "name": "能效分析服务",
      "category": "能效分析",
      "desc": "PUE 能耗数据对外 API 服务与能效分析。",
      "dataOwner": "智慧运维室",
      "govSpecialist": "业务数据治理专员",
      "manager": "数据管理人员",
      "usageType": "申请",
      "securityLevel": "L2",
      "tableIds": [],
      "serviceIds": [
        "svc_003"
      ],
      "status": "已上架",
      "featured": false,
      "listedAt": "2026-07-12",
      "approval": [
        {
          "step": "发起上架",
          "actor": "数据管理人员",
          "action": "提交",
          "time": "2026-07-10",
          "comment": "业务方已同意共享"
        },
        {
          "step": "业务方审批",
          "actor": "业务数据治理专员",
          "action": "通过",
          "time": "2026-07-11",
          "comment": "同意共享"
        },
        {
          "step": "上架",
          "actor": "数据管理人员",
          "action": "上架",
          "time": "2026-07-12",
          "comment": ""
        }
      ]
    },
    {
      "id": "pa_008",
      "name": "核心工艺参数共享",
      "category": "工艺标准",
      "desc": "液冷核心工艺参数（涉密）数据共享。",
      "dataOwner": "研发设计室",
      "govSpecialist": "业务数据治理专员",
      "manager": "数据管理人员",
      "usageType": "下载",
      "securityLevel": "L4",
      "tableIds": [
        "t_process"
      ],
      "serviceIds": [
        "svc_004"
      ],
      "status": "已上架",
      "featured": false,
      "listedAt": "2026-07-15",
      "approval": [
        {
          "step": "发起上架",
          "actor": "数据管理人员",
          "action": "提交",
          "time": "2026-07-13",
          "comment": "业务方已同意共享"
        },
        {
          "step": "业务方审批",
          "actor": "业务数据治理专员",
          "action": "通过",
          "time": "2026-07-14",
          "comment": "涉密数据，确认授权范围"
        },
        {
          "step": "上架",
          "actor": "数据管理人员",
          "action": "上架",
          "time": "2026-07-15",
          "comment": ""
        }
      ]
    }
  ],
  "portalRequests": [
    {
      "id": "pr_001",
      "portalAssetId": "pa_002",
      "applicant": "业务用户",
      "type": "开通",
      "status": "已开通",
      "requestAt": "2026-07-05"
    },
    {
      "id": "pr_002",
      "portalAssetId": "pa_001",
      "applicant": "业务用户",
      "type": "下载",
      "status": "已下载",
      "requestAt": "2026-07-06"
    },
    {
      "id": "pr_003",
      "portalAssetId": "pa_005",
      "applicant": "业务用户",
      "type": "开通",
      "status": "审批中",
      "requestAt": "2026-07-16"
    },
    {
      "id": "pr_004",
      "portalAssetId": "pa_007",
      "applicant": "业务用户",
      "type": "开通",
      "status": "已开通",
      "requestAt": "2026-07-14"
    }
  ],
  "capabilityMap": [
    {
      "id": "项目经营域",
      "name": "项目经营域",
      "items": [
        {
          "id": "商机管理",
          "name": "商机管理"
        },
        {
          "id": "投标管理",
          "name": "投标管理"
        },
        {
          "id": "合同管理",
          "name": "合同管理"
        },
        {
          "id": "成本管控",
          "name": "成本管控"
        },
        {
          "id": "投资测算与评价",
          "name": "投资测算与评价"
        }
      ]
    },
    {
      "id": "设计研发域",
      "name": "设计研发域",
      "items": [
        {
          "id": "产品设计",
          "name": "产品设计"
        },
        {
          "id": "BOM管理",
          "name": "BOM管理"
        },
        {
          "id": "工艺设计",
          "name": "工艺设计"
        },
        {
          "id": "热仿真",
          "name": "热仿真"
        },
        {
          "id": "样机测试",
          "name": "样机测试"
        },
        {
          "id": "设计评审",
          "name": "设计评审"
        },
        {
          "id": "成果管理",
          "name": "成果管理"
        }
      ]
    },
    {
      "id": "生产制造域",
      "name": "生产制造域",
      "items": [
        {
          "id": "采购",
          "name": "采购"
        },
        {
          "id": "生产计划",
          "name": "生产计划"
        },
        {
          "id": "工序管理",
          "name": "工序管理"
        },
        {
          "id": "质量检验",
          "name": "质量检验"
        },
        {
          "id": "仓储物流",
          "name": "仓储物流"
        },
        {
          "id": "供应链",
          "name": "供应链"
        }
      ]
    },
    {
      "id": "集成实施域",
      "name": "集成实施域",
      "items": [
        {
          "id": "工程实施",
          "name": "工程实施"
        },
        {
          "id": "调试交付",
          "name": "调试交付"
        },
        {
          "id": "现场服务",
          "name": "现场服务"
        },
        {
          "id": "项目验收",
          "name": "项目验收"
        }
      ]
    },
    {
      "id": "智慧运维域",
      "name": "智慧运维域",
      "items": [
        {
          "id": "遥测监控",
          "name": "遥测监控"
        },
        {
          "id": "告警管理",
          "name": "告警管理"
        },
        {
          "id": "能效分析",
          "name": "能效分析"
        },
        {
          "id": "预测性维护",
          "name": "预测性维护"
        },
        {
          "id": "备件管理",
          "name": "备件管理"
        }
      ]
    }
  ]
};

export default D;
