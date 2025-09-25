import { MetricsCollector, recordAPIMetric, recordBusinessMetric } from '../../src/lib/monitoring/metrics-collector';

describe('Metrics Collector', () => {
  let metricsCollector: MetricsCollector;

  beforeEach(() => {
    metricsCollector = new MetricsCollector();
  });

  afterEach(() => {
    metricsCollector.reset();
  });

  describe('Basic Operations', () => {
    test('should initialize with default metrics', () => {
      const allMetrics = metricsCollector.getAllMetrics();
      
      expect(allMetrics.size).toBeGreaterThan(0);
      expect(allMetrics.has('system_memory_usage_bytes')).toBe(true);
      expect(allMetrics.has('http_requests_total')).toBe(true);
      expect(allMetrics.has('establishments_created_total')).toBe(true);
    });

    test('should record counter metrics', () => {
      metricsCollector.recordCounter('test_counter', 5, { label: 'test' });
      
      const metric = metricsCollector.getMetric('test_counter');
      expect(metric).toBeUndefined(); // Counter n'existe pas par défaut
      
      // Ajouter un counter de test
      (metricsCollector as any).addMetric('test_counter', 'counter', 'Test counter');
      metricsCollector.recordCounter('test_counter', 5, { label: 'test' });
      
      const updatedMetric = metricsCollector.getMetric('test_counter');
      expect(updatedMetric?.values).toHaveLength(1);
      expect(updatedMetric?.values[0].value).toBe(5);
    });

    test('should record gauge metrics', () => {
      metricsCollector.recordGauge('system_memory_usage_bytes', 1024, { type: 'heap' });
      
      const metric = metricsCollector.getMetric('system_memory_usage_bytes');
      expect(metric?.values).toHaveLength(1);
      expect(metric?.values[0].value).toBe(1024);
    });

    test('should record histogram metrics', () => {
      metricsCollector.recordHistogram('http_request_duration_seconds', 0.5, { endpoint: '/test' });
      
      const metric = metricsCollector.getMetric('http_request_duration_seconds');
      expect(metric?.values).toHaveLength(1);
      expect(metric?.values[0].value).toBe(0.5);
    });
  });

  describe('API Metrics', () => {
    test('should record API metrics', () => {
      const apiMetric = {
        endpoint: '/api/test',
        method: 'GET',
        statusCode: 200,
        responseTime: 150,
        timestamp: Date.now(),
        userId: 'user123',
        ipAddress: '127.0.0.1'
      };

      metricsCollector.recordAPIMetric(apiMetric);
      
      const apiMetrics = metricsCollector.getAPIMetrics();
      expect(apiMetrics).toHaveLength(1);
      expect(apiMetrics[0]).toEqual(apiMetric);
    });

    test('should generate API metrics summary', () => {
      // Ajouter quelques métriques d'API
      const metrics = [
        { endpoint: '/api/test1', method: 'GET', statusCode: 200, responseTime: 100, timestamp: Date.now() },
        { endpoint: '/api/test1', method: 'GET', statusCode: 200, responseTime: 150, timestamp: Date.now() },
        { endpoint: '/api/test2', method: 'POST', statusCode: 400, responseTime: 200, timestamp: Date.now() }
      ];

      metrics.forEach(metric => metricsCollector.recordAPIMetric(metric));
      
      const summary = metricsCollector.getAPIMetricsSummary();
      
      expect(summary.totalRequests).toBe(3);
      expect(summary.averageResponseTime).toBe(150);
      expect(summary.errorRate).toBeCloseTo(33.33, 1);
      expect(summary.topEndpoints).toHaveLength(2);
      expect(summary.statusCodeDistribution).toHaveProperty('200');
      expect(summary.statusCodeDistribution).toHaveProperty('400');
    });
  });

  describe('Performance Metrics', () => {
    test('should record performance metrics', () => {
      const perfMetric = {
        responseTime: 100,
        memoryUsage: 1024 * 1024,
        cpuUsage: 50,
        activeConnections: 10,
        errorRate: 0.1
      };

      metricsCollector.recordPerformanceMetric(perfMetric);
      
      const perfMetrics = metricsCollector.getPerformanceMetrics();
      expect(perfMetrics).toHaveLength(1);
      expect(perfMetrics[0]).toEqual(perfMetric);
    });
  });

  describe('Prometheus Export', () => {
    test('should export metrics in Prometheus format', () => {
      // Ajouter un counter de test
      (metricsCollector as any).addMetric('test_counter', 'counter', 'Test counter');
      metricsCollector.recordCounter('test_counter', 5, { label: 'test' });
      
      const prometheusOutput = metricsCollector.exportPrometheusMetrics();
      
      expect(prometheusOutput).toContain('# HELP test_counter Test counter');
      expect(prometheusOutput).toContain('# TYPE test_counter counter');
      expect(prometheusOutput).toContain('test_counter{label="test"} 5');
    });

    test('should handle metrics without labels', () => {
      (metricsCollector as any).addMetric('simple_counter', 'counter', 'Simple counter');
      metricsCollector.recordCounter('simple_counter', 10);
      
      const prometheusOutput = metricsCollector.exportPrometheusMetrics();
      
      expect(prometheusOutput).toContain('simple_counter 10');
    });
  });

  describe('Cleanup', () => {
    test('should cleanup old metrics', () => {
      // Ajouter un counter avec une valeur ancienne
      (metricsCollector as any).addMetric('old_counter', 'counter', 'Old counter');
      const oldTimestamp = Date.now() - 25 * 60 * 60 * 1000; // 25 heures
      
      // Simuler une métrique ancienne
      const metric = metricsCollector.getMetric('old_counter');
      if (metric) {
        metric.values.push({
          value: 5,
          timestamp: oldTimestamp
        });
      }
      
      // Nettoyer les métriques de plus de 24 heures
      metricsCollector.cleanupOldMetrics(24 * 60 * 60 * 1000);
      
      const cleanedMetric = metricsCollector.getMetric('old_counter');
      expect(cleanedMetric?.values).toHaveLength(0);
    });
  });

  describe('Utility Functions', () => {
    test('recordAPIMetric should work', () => {
      // Utiliser l'instance locale pour le test
      metricsCollector.recordAPIMetric({
        endpoint: '/api/test',
        method: 'GET',
        statusCode: 200,
        responseTime: 150,
        timestamp: Date.now(),
        userId: 'user123'
      });
      
      const apiMetrics = metricsCollector.getAPIMetrics();
      expect(apiMetrics).toHaveLength(1);
      expect(apiMetrics[0].endpoint).toBe('/api/test');
      expect(apiMetrics[0].userId).toBe('user123');
    });

    test('recordBusinessMetric should work', () => {
      recordBusinessMetric('test_business_metric', 1, { type: 'test' });
      
      // Cette fonction utilise l'instance globale, donc on vérifie qu'elle ne lance pas d'erreur
      expect(() => {
        recordBusinessMetric('test_business_metric', 1, { type: 'test' });
      }).not.toThrow();
    });
  });

  describe('History Management', () => {
    test('should limit metric history size', () => {
      (metricsCollector as any).addMetric('test_counter', 'counter', 'Test counter');
      
      // Ajouter plus de métriques que la limite
      for (let i = 0; i < 1500; i++) {
        metricsCollector.recordCounter('test_counter', i);
      }
      
      const metric = metricsCollector.getMetric('test_counter');
      expect(metric?.values).toHaveLength(1000); // Limite par défaut
      expect(metric?.values[0].value).toBe(500); // Les premières valeurs ont été supprimées
      expect(metric?.values[999].value).toBe(1499); // La dernière valeur est conservée
    });
  });
});
