#include <WiFi.h>
#include <PubSubClient.h> 
#include <WiFiClientSecure.h> // Wajib untuk port aman 8883

// Konfigurasi WiFi
const char* ssid = "XPR9FE"; 
const char* password = "a87acz6sczsay8t";

// Konfigurasi MQTT HiveMQ
const char* mqtt_server = "9575f087603642b38802e20db41742bf.s1.eu.hivemq.cloud"; 
const int mqtt_port = 8883;
const char* mqtt_user = "ooharamiyazono"; // Pastikan username ini sudah sesuai di HiveMQ Anda
const char* mqtt_pass = "OoharaMiyazono1";  

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
      Serial.print("Gagal, rc=");
      Serial.print(client.state());
      Serial.println(" mencoba lagi dalam 5 detik...");
      delay(5000);
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
  
  espClient.setInsecure(); // Mengabaikan pemeriksaan sertifikat SSL terenkripsi
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Generasi data acak (dummy) parameter sensor
  float phValue     = randomFloat(6.0, 8.0);
  float tdsValue    = randomFloat(100.0, 800.0);
  float temperature = randomFloat(26.0, 31.0);

  // Kirim data ke masing-masing topik target
  client.publish("sensor/ph", String(phValue, 2).c_str());
  client.publish("sensor/tds", String(tdsValue, 0).c_str());
  client.publish("sensor/suhu", String(temperature, 2).c_str());
  
  // Monitoring melalui Serial Monitor
  Serial.println("========== DATA TERKIRIM ==========");
  Serial.print("pH   : "); Serial.println(phValue, 2);
  Serial.print("TDS  : "); Serial.print(tdsValue, 0); Serial.println(" ppm");
  Serial.print("Suhu : "); Serial.print(temperature, 2); Serial.println(" C");
  Serial.println("===================================");
  
  // Jeda waktu pengiriman data (diubah ke 2 detik agar tidak di-banned/disconnect oleh broker)
  delay(2000); 
}