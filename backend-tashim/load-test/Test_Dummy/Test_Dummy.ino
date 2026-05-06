#include <WiFi.h>
#include <PubSubClient.h> 
#include <WiFiClientSecure.h> // Wajib untuk port 8883

const char* ssid = "FAA WIFI"; 
const char* password = "ADAM KANCIL";

// Konfigurasi MQTT HiveMQ
const char* mqtt_server = "9575f087603642b38802e20db41742bf.s1.eu.hivemq.cloud"; 
const int mqtt_port = 8883;
const char* mqtt_user = "tetomiku";   
const char* mqtt_pass = "TetoMiku1";  

WiFiClientSecure espClient; 
PubSubClient client(espClient);

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Menghubungkan ke MQTT...");
    String clientId = "ESP32LoadTester-" + String(random(0xffff), HEX);
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
      Serial.println("Terhubung ke MQTT!");
    } else {
      delay(2000);
    }
  }
}

float randomFloat(float minVal, float maxVal) {
  return minVal + ((float)random(0, 10000) / 10000.0) * (maxVal - minVal);
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  randomSeed(micros());  
  connectWiFi();
  
  espClient.setInsecure(); // Abaikan pengecekan sertifikat SSL
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  float suhu = randomFloat(27.0, 30.0);
  float ntu  = randomFloat(0.0, 12.0);
  float ph   = randomFloat(6.0, 8.0);

  // Konversi float ke string [cite: 7]
  char strSuhu[8], strNtu[8], strPh[8];
  dtostrf(suhu, 1, 2, strSuhu);
  dtostrf(ntu, 1, 2, strNtu);
  dtostrf(ph, 1, 2, strPh);

  // Publish ke topik MQTT
  client.publish("tetomiku/sensor/suhu", strSuhu);
  client.publish("tetomiku/sensor/ntu", strNtu);
  client.publish("tetomiku/sensor/ph", strPh);
  
  Serial.println("Data terkirim ke MQTT...");
  delay(20); // Kecepatan tinggi untuk load testing
}