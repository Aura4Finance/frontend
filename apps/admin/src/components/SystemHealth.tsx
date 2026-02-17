import DashboardWrapper from "./layout/DashboardWrapper";
import { FiCheckCircle, FiAlertCircle, FiXCircle, FiServer, FiDatabase, FiGlobe, FiCpu, FiHardDrive, FiActivity } from "react-icons/fi";
import { useSystemHealth } from "./hooks/useSystemHealth";
import ErrorState from "./shared/ErrorState";

const SystemHealth = () => {
  const { data: healthData, isLoading, error, refetch } = useSystemHealth();
  const getServiceIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    if (name.includes('api') || name.includes('gateway')) return FiServer;
    if (name.includes('database') || name.includes('db')) return FiDatabase;
    if (name.includes('blockchain') || name.includes('rpc')) return FiGlobe;
    if (name.includes('payment') || name.includes('processor')) return FiCpu;
    if (name.includes('storage') || name.includes('file')) return FiHardDrive;
    if (name.includes('analytics') || name.includes('engine')) return FiActivity;
    return FiServer;
  };

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || '';
    switch (normalizedStatus) {
      case "healthy":
      case "operational": return <FiCheckCircle className="w-4 h-4 text-green-500" />;
      case "degraded":
      case "warning": return <FiAlertCircle className="w-4 h-4 text-yellow-500" />;
      case "unhealthy":
      case "down": return <FiXCircle className="w-4 h-4 text-red-500" />;
      default: return <FiCheckCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBg = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || '';
    switch (normalizedStatus) {
      case "healthy":
      case "operational": return "bg-green-100 text-green-700";
      case "degraded":
      case "warning": return "bg-yellow-100 text-yellow-700";
      case "unhealthy":
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

  const services = Array.isArray(healthData) ? healthData : [];
  const recentIncidents: any[] = [];
  const operationalCount = services.filter((s: any) => 
    s.status?.toLowerCase() === "healthy" || 
    s.status?.toLowerCase() === "operational"
  ).length;
  const overallStatus = operationalCount === services.length && services.length > 0
    ? "All Systems Operational" 
    : "Partial Service Disruption";

  if (isLoading) {
    return (
      <DashboardWrapper>
        <div className="px-4 py-3 bg-white border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900">System Health</h1>
          <p className="text-gray-500 text-xs mt-0.5">Monitor system status and service health</p>
        </div>
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="h-32 bg-gray-200 rounded-xl"></div>
              <div className="h-32 bg-gray-200 rounded-xl"></div>
              <div className="h-32 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </DashboardWrapper>
    );
  }

  if (error) {
    return (
      <DashboardWrapper>
        <div className="px-4 py-3 bg-white border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900">System Health</h1>
          <p className="text-gray-500 text-xs mt-0.5">Monitor system status and service health</p>
        </div>
        <div className="p-4">
          <ErrorState 
            message="Failed to load system health data" 
            onRetry={refetch}
            type="error" 
          />
        </div>
      </DashboardWrapper>
    );
  }

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
          {services.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No services data available
            </div>
          ) : (
            services.map((service: any) => {
              const Icon = getServiceIcon(service.name);
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
                    <div><p className="text-[10px] text-gray-500 mb-0.5">Uptime</p><p className="text-sm font-semibold text-gray-900">{service.uptime || 0}%</p></div>
                    <div><p className="text-[10px] text-gray-500 mb-0.5">Response</p><p className="text-sm font-semibold text-gray-900">{service.responseTime || 0}ms</p></div>
                  </div>
                  <div className="mt-3">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          service.status?.toLowerCase() === "healthy" || service.status?.toLowerCase() === "operational" 
                            ? "bg-green-500" 
                            : service.status?.toLowerCase() === "degraded" || service.status?.toLowerCase() === "warning" 
                            ? "bg-yellow-500" 
                            : "bg-red-500"
                        }`} 
                        style={{ width: `${service.uptime || 0}%` }} 
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Recent Incidents */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Incidents</h3>
          <div className="space-y-3">
            {recentIncidents.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No recent incidents reported
              </div>
            ) : (
              recentIncidents.map((incident: any) => (
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
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
};

export default SystemHealth;
