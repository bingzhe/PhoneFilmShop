// 全局状态
const projectName = ref('科迪亚')

export function useProjectName() {
  // 本地状态

  function setProjectName(name: string) {
    projectName.value = name
  }

  return {
    projectName,
    setProjectName,
  }
}
