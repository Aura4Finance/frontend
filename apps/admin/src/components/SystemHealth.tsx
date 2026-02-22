import DashboardWrapper from "./layout/DashboardWrapper";
import { FiCheckCircle, FiAlertCircle, FiXCircle, FiServer, FiDatabase, FiGlobe, FiCpu, FiActivity, FiClock, FiBox } from "react-icons/fi";
import { useSystemHealth } from "./hooks/useSystemHealth";
import type { ServiceHealth } from "./hooks/useSystemHealth";
import ErrorState from "./shared/ErrorState";

const SystemHealth = () => {
  const { data: healthData, isLoading, error, refetch } = useSystemHealth();

  const getServiceIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    if (name.includes("api") || name.includes("gateway")) return FiServer;
    if (name.includes("database") || name.includes("db")) return FiDatabase;
    if (name.includes("blockchain") || name.includes("rpc")) return FiGlobe;
    if (name.includes("payment") || name.includes("processor")) return FiCpu;
    return FiServer;
  };

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

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const overallStatus = healthData?.overallStatus ?? "Unknown";
  const services = healthData?.services ?? [];
  const operationalCount = healthData?.operationalCount ?? 0;
  const totalServices = healthData?.totalServices ?? 0;
  const statusType = healthData?.status ?? "unknown";

  const getBannerGradient = () => {
    switch (statusType) {
      case "operational": return "bg-gradient-to-r from-green-500 to-emerald-600";
      case "degraded": return "bg-gradient-to-r from-yellow-500 to-orange-500";
      case "down": return "bg-gradient-to-r from-red-500 to-rose-600";
      default: return "bg-gradient-to-r from-gray-500 to-gray-600";
    }
  };

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="h-28 bg-gray-200 rounded-xl"></div>
              <div className="h-28 bg-gray-200 rounded-xl"></div>
              <div className="h-28 bg-gray-200 rounded-xl"></div>
              <div className="h-28 bg-gray-200 rounded-xl"></div>
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
        <div className={`rounded-xl p-4 mb-5 ${getBannerGradient()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {statusType === "operational" ? (
                <FiCheckCircle className="w-8 h-8 text-white" />
              ) : statusType === "degraded" ? (
                <FiAlertCircle className="w-8 h-8 text-white" />
              ) : (
                <FiXCircle className="w-8 h-8 text-white" />
              )}
              <div>
                <h2 className="text-lg font-bold text-white">{overallStatus}</h2>
                <p className="text-white/80 text-xs">
                  {operationalCount} of {totalServices} services operational
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-white/80 text-xs">
                <FiClock className="w-3 h-3" />
                <span>Uptime: {formatUptime(healthData?.uptimeSeconds ?? 0)}</span>
              </div>
              {healthData?.timestamp && (
                <p className="text-white/60 text-[10px] mt-0.5">
                  {new Date(healthData.timestamp).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Service Status Grid */}
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {services.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No services data available
            </div>
          ) : (
            services.map((service: ServiceHealth) => {
              const Icon = getServiceIcon(service.name);
              return (
                <div key={service.name} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-xs text-gray-900">{service.name}</h3>
                        <span className={`inline-flex px-1.5 py-0.5 text-[9px] font-medium rounded-full capitalize ${getStatusBg(service.status)}`}>
                          {service.status}
                        </span>
                      </div>
                    </div>
                    {getStatusIcon(service.status)}
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 mb-0.5">Response Time</p>
                    <p className="text-sm font-semibold text-gray-900">{service.responseTime}ms</p>
                  </div>
                  {service.message && (
                    <p className="text-[10px] text-yellow-600 mt-2 bg-yellow-50 rounded px-2 py-1">{service.message}</p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* System Metrics & App Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* System Metrics */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <FiActivity className="w-4 h-4 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-900">System Metrics</h3>
            </div>
            {healthData?.system ? (
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Memory</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-xs font-semibold text-gray-900">{healthData.system.memory.rssMB} MB</p>
                      <p className="text-[9px] text-gray-500">RSS</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-xs font-semibold text-gray-900">{healthData.system.memory.heapUsedMB} MB</p>
                      <p className="text-[9px] text-gray-500">Heap Used</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-xs font-semibold text-gray-900">{healthData.system.memory.heapTotalMB} MB</p>
                      <p className="text-[9px] text-gray-500">Heap Total</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">CPU Load</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-xs font-semibold text-gray-900">{healthData.system.cpu.load1m}</p>
                      <p className="text-[9px] text-gray-500">1 min</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-xs font-semibold text-gray-900">{healthData.system.cpu.load5m}</p>
                      <p className="text-[9px] text-gray-500">5 min</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-xs font-semibold text-gray-900">{healthData.system.cpu.load15m}</p>
                      <p className="text-[9px] text-gray-500">15 min</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-xs">No system metrics available</p>
            )}
          </div>

          {/* App Info */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <FiBox className="w-4 h-4 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-900">App Info</h3>
            </div>
            {healthData?.app ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Environment</p>
                  <span className="text-xs font-semibold text-gray-900 capitalize">{healthData.app.env}</span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Version</p>
                  <span className="text-xs font-semibold text-gray-900">{healthData.app.version}</span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Node Version</p>
                  <span className="text-xs font-semibold text-gray-900">{healthData.app.nodeVersion}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-xs">No app info available</p>
            )}
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
};

export default SystemHealth;
