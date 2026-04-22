import HomeClient from '@/app/(patient)/home/HomeClient'

export default function PreviewHome() {
  return (
    <HomeClient
      patientName="김수면"
      todayDiary={null}
      hasPrescription={true}
      yesterdayDiary={{ bedtime: '23:30', wake_time: '06:30', sleep_quality: 4 }}
      yesterdayEfficiency={82}
      yesterdayEfficiencyLevel="주의"
      yesterdaySleepDuration="6시간 30분"
      pushEnabled={true}
    />
  )
}
