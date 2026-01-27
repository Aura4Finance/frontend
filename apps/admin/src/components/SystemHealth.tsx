import DashboardWrapper from "./layout/DashboardWrapper";
import { FiCheckCircle, FiAlertCircle, FiXCircle, FiServer, FiDatabase, FiGlobe, FiCpu, FiHardDrive, FiActivity } from "react-icons/fi";

const services = [
  { name: "API Gateway", status: "operational", uptime: 99.98, responseTime: 45, icon: FiServer },
  { name: "Database", status: "operational", uptime: 99.95, responseTime: 12, icon: FiDatabase },
  { name: "Blockchain RPC", status: "operational", uptime: 99.87, responseTime: 85, icon: FiGlobe },
  { name: "Payment Processor", status: "degraded", uptime: 98.45, responseTime: 320, icon: FiCpu },
  { name: "File Storage", status: "operational", uptime: 99.99, responseTime: 25, icon: FiHardDrive },
  { name: "Analytics Engine", status: "operational", uptime: 99.92, responseTime: 68, icon: FiActivity },
];

const recentIncidents = [
  { id: 1, title: "Payment Processor High Latency", status: "investigating", time: "15 mins ago", severity: "warning" },
  { id: 2, title: "Scheduled Maintenance Completed", status: "resolved", time: "2 hours ago", severity: "info" },
  { id: 3, title: "API Rate Limit Adjustment", status: "resolved", time: "1 day ago", severity: "info" },
];

const SystemHealth = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational": return <FiCheckCircle className="w-4 h-4 text-green-500" />;
      case "degraded": return <FiAlertCircle className="w-4 h-4 text-yellow-500" />;
      case "down": return <FiXCircle className="w-4 h-4 text-red-500" />;
      default: return <FiCheckCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "operational": return "bg-green-100 text-green-700";
      case "degraded": return "bg-yellow-100 text-yellow-700";
      case "down": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getIncidentColor = (severity: string) => {
    switch (severity) {
      case "critical": return "border-l-red-500";
      case "warning": return "border-l-yellow-500";
      default: return "border-l-blue-500";
    }
  };

  const operationalCount = services.filter(s => s.status === "operational").length;
  const overallStatus = operationalCount === services.length ? "All Systems Operational" : "Partial Service Disruption";

  return (
    <DashboardWrapper>
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-900">System Health</h1>
        <p className="text-gray-500 text-xs mt-0.5">Monitor system status and service health</p>
      </div>

      <div className="p-4">
        {/* Overall Status Banner */}
        <div className={`rounded-xl p-4 mb-5 ${operationalCount === services.length ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-yellow-500 to-orange-500"}`}>
          <div className="flex items-center gap-3">
            {operationalCount === services.length ? <FiCheckCircle className="w-8 h-8 text-white" /> : <FiAlertCircle className="w-8 h-8 text-white" />}
            <div>
              <h2 className="text-lg font-bold text-white">{overallStatus}</h2>
              <p className="text-white/80 text-xs">{operationalCount} of {services.length} services running smoothly</p>
            </div>
          </div>
        </div>

        {/* Service Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div key={service.name} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gray-100 rounded-lg"><Icon className="w-4 h-4 text-gray-600" /></div>
                    <div>
                      <h3 className="font-medium text-xs text-gray-900">{service.name}</h3>
                      <span className={`inline-flex px-1.5 py-0.5 text-[9px] font-medium rounded-full capitalize ${getStatusBg(service.status)}`}>{service.status}</span>
                    </div>
                  </div>
                  {getStatusIcon(service.status)}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-[10px] text-gray-500 mb-0.5">Uptime</p><p className="text-sm font-semibold text-gray-900">{service.uptime}%</p></div>
                  <div><p className="text-[10px] text-gray-500 mb-0.5">Response</p><p className="text-sm font-semibold text-gray-900">{service.responseTime}ms</p></div>
                </div>
                <div className="mt-3">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${service.status === "operational" ? "bg-green-500" : service.status === "degraded" ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${service.uptime}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Incidents */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Incidents</h3>
          <div className="space-y-3">
            {recentIncidents.map((incident) => (
              <div key={incident.id} className={`border-l-4 ${getIncidentColor(incident.severity)} bg-gray-50 rounded-r-lg p-3`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-xs text-gray-900">{incident.title}</h4>
                    <p className="text-[11px] text-gray-500">{incident.time}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full capitalize ${
                    incident.status === "resolved" ? "bg-green-100 text-green-700" :
                    incident.status === "investigating" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                  }`}>{incident.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
};

export default SystemHealth;
