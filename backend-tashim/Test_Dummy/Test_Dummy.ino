#include <WiFi.h>
#include <PubSubClient.h> // Library tambahan wajib untuk MQTT
#include <WiFiClientSecure.h> // WAJIB DITAMBAHKAN untuk menembus Port 8883

// Konfigurasi WiFi dari kode sumber Anda
const char* ssid = "XPR9FE"; 
const char* password = "a87acz6sczsay8t";

// Konfigurasi MQTT
// Ganti "broker.hivemq.com" dengan alamat URL cluster Anda jika "tetomiku" adalah bagian dari host/URL
const char* mqtt_server = "9575f087603642b38802e20db41742bf.s1.eu.hivemq.cloud"; 
const int mqtt_port = 8883;
const char* mqtt_user = "tetomiku";   // Cluster / Username
const char* mqtt_pass = "TetoMiku1";  // Password

WiFiClientSecure espClient; 
PubSubClient client(espClient);

// Fungsi koneksi WiFi bawaan dari Anda
void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

// Fungsi baru: Menjaga dan menghubungkan ulang sesi MQTT jika terputus
void reconnect() {
  while (!client.connected()) {
    Serial.print("Menghubungkan ke MQTT...");
    // Membuat Client ID acak
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);
    
    // Autentikasi dengan user 'tetomiku' dan pass 'TetoMiku1'
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
      Serial.println("Terhubung ke MQTT!");
    } else {
      Serial.print("Gagal, status=");
      Serial.print(client.state());
      Serial.println(" Coba lagi dalam 5 detik");
      delay(5000);
    }
  }
}

// Fungsi generate float random (Dummy data)
float randomFloat(float minVal, float maxVal) {
  return minVal + ((float)random(0, 10000) / 10000.0) * (maxVal - minVal);
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  randomSeed(micros());  // Seed random
  connectWiFi();
  
  // WAJIB DITAMBAHKAN: Mengabaikan pengecekan sertifikat SSL
  espClient.setInsecure(); 

  // Mengarahkan ESP32 ke server MQTT
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  // Mengecek dan memastikan koneksi MQTT terus berjalan
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Generate data dummy untuk pengujian
  float suhu = randomFloat(27.0, 30.0);
  float ntu  = randomFloat(0.0, 12.0);
  float ph   = randomFloat(6.0, 8.0);

  Serial.println("===== DATA SENSOR =====");
  Serial.print("Suhu (C): "); Serial.println(suhu, 2);
  Serial.print("NTU: ");      Serial.println(ntu, 2);
  Serial.print("pH: ");       Serial.println(ph, 2);
  Serial.println("=======================\n");

  // Konversi nilai float menjadi string (char array) agar bisa dikirim via MQTT
  char strSuhu[8];
  char strNtu[8];
  char strPh[8];
  
  dtostrf(suhu, 1, 2, strSuhu);
  dtostrf(ntu, 1, 2, strNtu);
  dtostrf(ph, 1, 2, strPh);

  // Proses pengiriman (Publish) ke broker MQTT
  // Topik disesuaikan dengan nama cluster Anda untuk kerapian manajemen data
  client.publish("tetomiku/sensor/suhu", strSuhu);
  client.publish("tetomiku/sensor/ntu", strNtu);
  client.publish("tetomiku/sensor/ph", strPh);

  delay(5000); // kirim tiap 5 detik
}