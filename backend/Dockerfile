FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY . .

RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

EXPOSE 8080

ENTRYPOINT ["java","-Dserver.port=8080","-jar","target/equisplit-0.0.1-SNAPSHOT.jar"]