FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY . .

RUN sed -i 's/\r$//' mvnw && chmod +x mvnw
RUN ./mvnw dependency:go-offline

EXPOSE 8080

CMD ["./mvnw", "spring-boot:run"]
