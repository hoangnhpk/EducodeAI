import { Redirect, useLocalSearchParams } from 'expo-router';

/** Legacy detail route → canonical /course/[courseId]. */
export default function KhoaHocDetailRedirect() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  return <Redirect href={`/course/${courseId}`} />;
}
