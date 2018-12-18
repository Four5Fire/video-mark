# From java image, version:8
FROM java:8

# 挂载app目录
VOLUME /app

COPY ./config/ ./config/

# COPY or ADD to image
COPY ./target/video-mark-0.0.1-SNAPSHOT.jar app.jar

RUN bash -c "touch /app.jar"
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]