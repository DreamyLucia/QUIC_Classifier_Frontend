export default {
  productName: '流量慧眼',
  message: {
    error: {
      usernameEmpty: '用户名不能为空',
      passwordEmpty: '密码不能为空',
      recheckPasswordEmpty: '请再次确认密码',
      passwordMismatch: '两次输入的密码不一致',
      getUserInfoError: '获取用户信息失败',
      netError: '网络不佳，请稍后重试',
      signUp: '注册失败，请稍后重试',
      signIn: '登录失败，请稍后重试',
      reset: '重置密码失败，请稍后重试',
      uploadError: '上传失败，请稍后重试',
      uploadFileType: '文件格式错误，请上传 .pcap 格式的文件',
      uploadFileSize: '文件大小超过 100MB 限制',
      noFile: '没有选择上传文件',
    },
    success: {
      signUp: '注册成功',
      signIn: '登录成功',
      reset: '重置密码成功',
      logout: '登出成功',
      upload: '上传成功，可在历史任务中查看',
      uploadFileClear: '已清除该文件',
      uploadAllFileClear: '已清除全部文件',
    },
    info: {

    },
  },
  signup: {
    title: '欢迎来到',
    label: '注册您的账号',
    usernamePlaceholder: '用户名',
    passwordPlaceholder: '密码',
    recheckPlaceholder: '确认密码',
    remember: '记住我',
    button: '注册',
    signinLabel: '已经有账号了？',
    signinButton: '去登录',
  },
  signin: {
    title: '欢迎回来',
    label: '登录您的账号',
    usernamePlaceholder: '用户名',
    passwordPlaceholder: '密码',
    remember: '记住我',
    forget: '忘记密码',
    button: '登录',
    signupLabel: '还没有账号？',
    signupButton: '去注册',
  },
  reset: {
    title: '要记住密码哦',
    label: '重置密码',
    usernamePlaceholder: '用户名',
    passwordPlaceholder: '密码',
    recheckPlaceholder: '确认密码',
    button: '重置',
  },
  home: {
    header: {
      pageList: {
        changelog: '更新日志',
      },
      login: '登录',
    },
    hero: {
      titles: {
        typed: [
          '一眼看穿QUIC业务',
          '加密流量，一眼识破',
          '慧眼识流，精准无忧',
          'QUIC业务，一目了然',
        ],
      },
      subtitle: {
        line1: 'AI驱动的QUIC加密流量分类平台',
        line2: '让加密流量变得清晰可见',
      },
      buttons: {
        primary: '开始使用',
        secondary: '快速上手',
      },
    },
  },
  siderbar: {
    userId: '用户ID：',
    appButtons: {
      upload: '上传流量包',
      overview: '数据总览',
      history: '查看历史任务',
      admin: '管理员面板',
    },
  },
  dashboard: {
    dragText: '点击或拖拽流量包文件到此区域上传',
    hint: '支持单个或批量上传，仅支持pcap格式',
    upload: {
      startUpload: '开始上传',
      uploadingStatus: '上传中...',
      clearAll: '清空全部',
      pending: '待上传',
      common: {
        task: '任务',
        unit: '个',
        all: '全部',
        file: '文件',
        upload: '上传',
        success: '成功',
        fail: '失败',
      },
    },
  },
}
