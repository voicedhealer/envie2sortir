interface MetricValue {
  value: number;
  timestamp: number;
  labels?: Record<string, string>;
}

interface Metric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  help: string;
  values: MetricValue[];
}

interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  errorRate: number;
}

interface APIMetrics {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: number;
  userId?: string;
  ipAddress?: string;
}

export class MetricsCollector {
  private metrics: Map<string, Metric> = new Map();
  private apiMetrics: APIMetrics[] = [];
  private performanceMetrics: PerformanceMetrics[] = [];
  private maxMetricsHistory = 1000;

  constructor() {
    this.initializeDefaultMetrics();
    this.startPerformanceMonitoring();
  }

  private initializeDefaultMetrics(): void {
    // Métriques de performance système
    this.addMetric('system_memory_usage_bytes', 'gauge', 'Memory usage in bytes');
    this.addMetric('system_cpu_usage_percent', 'gauge', 'CPU usage percentage');
    this.addMetric('system_active_connections', 'gauge', 'Number of active connections');
    
    // Métriques d'API
    this.addMetric('http_requests_total', 'counter', 'Total number of HTTP requests');
    this.addMetric('http_request_duration_seconds', 'histogram', 'HTTP request duration in seconds');
    this.addMetric('http_response_status_codes', 'counter', 'HTTP response status codes');
    
    // Métriques métier
    this.addMetric('establishments_created_total', 'counter', 'Total establishments created');
    this.addMetric('users_registered_total', 'counter', 'Total users registered');
    this.addMetric('searches_performed_total', 'counter', 'Total searches performed');
    this.addMetric('cache_hits_total', 'counter', 'Total cache hits');
    this.addMetric('cache_misses_total', 'counter', 'Total cache misses');
    
    // Métriques de health check
    this.addMetric('health_check_status', 'gauge', 'Health check status');
    this.addMetric('health_check_database_response_time', 'gauge', 'Database health check response time');
  }

  private addMetric(name: string, type: Metric['type'], help: string): void {
    this.metrics.set(name, {
      name,
      type,
      help,
      values: []
    });
  }

  private startPerformanceMonitoring(): void {
    // Vérifier si on est dans un environnement Edge Runtime
    if (typeof process === 'undefined' || typeof process.memoryUsage !== 'function') {
      console.warn('Performance monitoring disabled in Edge Runtime');
      return;
    }

    // Monitoring de la mémoire
    setInterval(() => {
      try {
        const memUsage = process.memoryUsage();
        this.recordGauge('system_memory_usage_bytes', memUsage.heapUsed, {
          type: 'heap'
        });
        this.recordGauge('system_memory_usage_bytes', memUsage.rss, {
          type: 'rss'
        });
      } catch (error) {
        console.warn('Memory monitoring failed:', error);
      }
    }, 5000); // Toutes les 5 secondes

    // Monitoring du CPU (simulation)
    setInterval(() => {
      try {
        const cpuUsage = this.getCPUUsage();
        this.recordGauge('system_cpu_usage_percent', cpuUsage);
      } catch (error) {
        console.warn('CPU monitoring failed:', error);
      }
    }, 5000);
  }

  private getCPUUsage(): number {
    // Simulation du monitoring CPU
    // En production, utiliser une bibliothèque comme 'pidusage'
    if (typeof process === 'undefined' || typeof process.cpuUsage !== 'function') {
      return 0; // Retourner 0 en Edge Runtime
    }
    
    try {
      const usage = process.cpuUsage();
      return (usage.user + usage.system) / 1000000; // Convertir en pourcentage
    } catch (error) {
      console.warn('CPU usage monitoring failed:', error);
      return 0;
    }
  }

  // Enregistrement des métriques
  recordCounter(name: string, value: number = 1, labels?: Record<string, string>): void {
    const metric = this.metrics.get(name);
    if (!metric || metric.type !== 'counter') {
      console.warn(`Metric ${name} not found or not a counter`);
      return;
    }

    metric.values.push({
      value,
      timestamp: Date.now(),
      labels
    });

    this.trimMetricHistory(metric);
  }

  recordGauge(name: string, value: number, labels?: Record<string, string>): void {
    const metric = this.metrics.get(name);
    if (!metric || metric.type !== 'gauge') {
      console.warn(`Metric ${name} not found or not a gauge`);
      return;
    }

    metric.values.push({
      value,
      timestamp: Date.now(),
      labels
    });

    this.trimMetricHistory(metric);
  }

  recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
    const metric = this.metrics.get(name);
    if (!metric || metric.type !== 'histogram') {
      console.warn(`Metric ${name} not found or not a histogram`);
      return;
    }

    metric.values.push({
      value,
      timestamp: Date.now(),
      labels
    });

    this.trimMetricHistory(metric);
  }

  // Métriques d'API
  recordAPIMetric(metric: APIMetrics): void {
    this.apiMetrics.push(metric);
    
    // Enregistrer dans les métriques générales
    this.recordCounter('http_requests_total', 1, {
      endpoint: metric.endpoint,
      method: metric.method,
      status_code: metric.statusCode.toString()
    });

    this.recordHistogram('http_request_duration_seconds', metric.responseTime / 1000, {
      endpoint: metric.endpoint,
      method: metric.method
    });

    // Limiter l'historique
    if (this.apiMetrics.length > this.maxMetricsHistory) {
      this.apiMetrics = this.apiMetrics.slice(-this.maxMetricsHistory);
    }
  }

  // Métriques de performance
  recordPerformanceMetric(metric: PerformanceMetrics): void {
    this.performanceMetrics.push(metric);
    this.recordGauge('system_memory_usage_bytes', metric.memoryUsage);
    this.recordGauge('system_cpu_usage_percent', metric.cpuUsage);
    this.recordGauge('system_active_connections', metric.activeConnections);

    // Limiter l'historique
    if (this.performanceMetrics.length > this.maxMetricsHistory) {
      this.performanceMetrics = this.performanceMetrics.slice(-this.maxMetricsHistory);
    }
  }

  private trimMetricHistory(metric: Metric): void {
    if (metric.values.length > this.maxMetricsHistory) {
      metric.values = metric.values.slice(-this.maxMetricsHistory);
    }
  }

  // Récupération des métriques
  getMetric(name: string): Metric | undefined {
    return this.metrics.get(name);
  }

  getAllMetrics(): Map<string, Metric> {
    return new Map(this.metrics);
  }

  getAPIMetrics(): APIMetrics[] {
    return [...this.apiMetrics];
  }

  getPerformanceMetrics(): PerformanceMetrics[] {
    return [...this.performanceMetrics];
  }

  // Statistiques agrégées
  getAPIMetricsSummary(): {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    topEndpoints: Array<{ endpoint: string; count: number }>;
    statusCodeDistribution: Record<string, number>;
  } {
    const totalRequests = this.apiMetrics.length;
    
    if (totalRequests === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
        topEndpoints: [],
        statusCodeDistribution: {}
      };
    }

    const totalResponseTime = this.apiMetrics.reduce((sum, m) => sum + m.responseTime, 0);
    const averageResponseTime = totalResponseTime / totalRequests;

    const errorCount = this.apiMetrics.filter(m => m.statusCode >= 400).length;
    const errorRate = (errorCount / totalRequests) * 100;

    // Top endpoints
    const endpointCounts = new Map<string, number>();
    this.apiMetrics.forEach(m => {
      endpointCounts.set(m.endpoint, (endpointCounts.get(m.endpoint) || 0) + 1);
    });

    const topEndpoints = Array.from(endpointCounts.entries())
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Distribution des codes de statut
    const statusCodeDistribution: Record<string, number> = {};
    this.apiMetrics.forEach(m => {
      const status = Math.floor(m.statusCode / 100) * 100;
      statusCodeDistribution[status.toString()] = (statusCodeDistribution[status.toString()] || 0) + 1;
    });

    return {
      totalRequests,
      averageResponseTime,
      errorRate,
      topEndpoints,
      statusCodeDistribution
    };
  }

  // Export des métriques au format Prometheus
  exportPrometheusMetrics(): string {
    const lines: string[] = [];
    
    this.metrics.forEach((metric) => {
      // Commentaire d'aide
      lines.push(`# HELP ${metric.name} ${metric.help}`);
      lines.push(`# TYPE ${metric.name} ${metric.type}`);
      
      // Valeurs
      metric.values.forEach((value) => {
        let line = `${metric.name}`;
        
        if (value.labels && Object.keys(value.labels).length > 0) {
          const labelPairs = Object.entries(value.labels)
            .map(([key, val]) => `${key}="${val}"`)
            .join(',');
          line += `{${labelPairs}}`;
        }
        
        line += ` ${value.value}`;
        lines.push(line);
      });
      
      lines.push(''); // Ligne vide entre les métriques
    });

    return lines.join('\n');
  }

  // Nettoyage des anciennes métriques
  cleanupOldMetrics(maxAge: number = 24 * 60 * 60 * 1000): void { // 24 heures par défaut
    const cutoffTime = Date.now() - maxAge;

    this.metrics.forEach((metric) => {
      metric.values = metric.values.filter(value => value.timestamp > cutoffTime);
    });

    this.apiMetrics = this.apiMetrics.filter(m => m.timestamp > cutoffTime);
    this.performanceMetrics = this.performanceMetrics.filter(m => m.timestamp > cutoffTime);
  }

  // Reset des métriques
  reset(): void {
    this.metrics.clear();
    this.apiMetrics = [];
    this.performanceMetrics = [];
    this.initializeDefaultMetrics();
  }
}

// Instance globale
export const metricsCollector = new MetricsCollector();

// Fonctions utilitaires
export function recordAPIMetric(endpoint: string, method: string, statusCode: number, responseTime: number, additionalData?: {
  userId?: string;
  ipAddress?: string;
}): void {
  metricsCollector.recordAPIMetric({
    endpoint,
    method,
    statusCode,
    responseTime,
    timestamp: Date.now(),
    ...additionalData
  });
}

export function recordBusinessMetric(metricName: string, value: number = 1, labels?: Record<string, string>): void {
  metricsCollector.recordCounter(metricName, value, labels);
}

export function recordPerformanceMetric(metric: PerformanceMetrics): void {
  metricsCollector.recordPerformanceMetric(metric);
}
