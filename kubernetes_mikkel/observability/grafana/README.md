# Grafana Observability Setup

## 1. Accessing Grafana

- Port-forward:
  ```powershell
  kubectl port-forward svc/grafana -n default 3000:3000
  ```
  Access at: http://localhost:3000 (default user: admin, password: admin)

- Or use NodePort:
  - Find your node IP and open http://<node-ip>:30300

## 2. Data Sources

- Prometheus and Loki are auto-provisioned (see `grafana-datasources.yaml`).
- You can also add them manually in the UI:
  - Prometheus URL: `http://prometheus:9090`
  - Loki URL: `http://loki:3100`

## 3. Example Dashboards & Queries

### Prometheus (PromQL)
- **RabbitMQ queue messages:**
  ```promql
  sum(rabbitmq_queue_messages_ready)
  ```
- **Pod CPU usage:**
  ```promql
  sum(rate(container_cpu_usage_seconds_total{image!=""}[5m])) by (pod)
  ```

### Loki (LogQL)
- **All logs from a microservice:**
  ```logql
  {app="order-handler"}
  ```
- **Error logs:**
  ```logql
  {app=~".*"} |= "error"
  ```

## 4. Sample Dashboard
- Import dashboards from [Grafana.com](https://grafana.com/grafana/dashboards/) or create your own.
- Example: [RabbitMQ Exporter Dashboard](https://grafana.com/grafana/dashboards/10991)

## 5. Helm Install (optional)
- To install Grafana via Helm:
  ```powershell
  helm repo add grafana https://grafana.github.io/helm-charts
  helm repo update
  helm install grafana grafana/grafana --set service.type=NodePort --set adminPassword=admin
  ```

## 6. Troubleshooting
- Check pod logs:
  ```powershell
  kubectl logs deployment/grafana
  kubectl logs deployment/prometheus
  kubectl logs deployment/loki
  kubectl logs deployment/promtail
  ```

---

**This setup provides a full observability stack for metrics, logs, and autoscaling in Kubernetes.**
