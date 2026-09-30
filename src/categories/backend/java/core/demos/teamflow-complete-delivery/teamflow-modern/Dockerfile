FROM eclipse-temurin:25-jre-noble

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -r /var/lib/apt/lists/* \
    && groupadd --system --gid 10001 teamflow \
    && useradd --system --uid 10001 --gid teamflow --home-dir /app --shell /usr/sbin/nologin teamflow

WORKDIR /app
COPY target/teamflow-modern.jar /app/app.jar
USER 10001:10001
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --retries=6 \
  CMD curl --fail --silent http://127.0.0.1:8080/actuator/health/readiness || exit 1
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
