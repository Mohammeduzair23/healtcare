import { Calendar, Users, TestTube, CheckSquare } from 'lucide-react';

function DoctorStatsCards({ 
  todayAppointmentsCount, 
  newPatientsCount, 
  labResultsCount, 
  pendingTasksCount 
}) {
  const cards = [
    {
      title: "Today's Appointments",
      value: todayAppointmentsCount,
      subtitle: "Scheduled",
      period: "This Week",
      icon: Calendar,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      checkColor: "text-blue-600"
    },
    {
      title: "New Patients",
      value: newPatientsCount,
      subtitle: "Scheduled",
      period: "This Week",
      icon: Users,
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      checkColor: "text-red-600"
    },
    {
      title: "Lab Results",
      value: labResultsCount,
      subtitle: "Awaiting Review",
      period: "Assmans",
      icon: TestTube,
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600",
      checkColor: "text-teal-600"
    },
    {
      title: "Pending Tasks",
      value: pendingTasksCount,
      subtitle: "Uten Sesjiik",
      period: "To Complete",
      icon: CheckSquare,
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      checkColor: "text-amber-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-600 mb-1">{card.title}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900">{card.value}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border-2 ${card.checkColor} border-current flex items-center justify-center`}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                  </svg>
                </div>
                <span className="text-xs text-gray-600">{card.subtitle}</span>
              </div>
              <span className="text-xs text-gray-500">{card.period}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DoctorStatsCards;