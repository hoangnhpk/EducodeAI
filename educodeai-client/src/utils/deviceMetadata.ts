import { getDeviceInfo } from './deviceHelper'

export const getCurrentDeviceMetadata = () => {
  const { maThietBi, tenThietBi } = getDeviceInfo()
  return { maThietBi, tenThietBi }
}
