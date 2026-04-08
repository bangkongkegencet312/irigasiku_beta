#include <WiFi.h>

// Ganti dengan WiFi kamu
const char* ssid = "NAMA_WIFI"; // isi dengan nama wifi
const char* password = "PASSWORD_WIFI"; // isi dengan password wifi

// verified connect wifi from micon
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

// Fungsi generate float random dalam range (Dummy data for censor)
float randomFloat(float minVal, float maxVal) {
  return minVal + ((float)random(0, 10000) / 10000.0) * (maxVal - minVal);
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  randomSeed(micros());  // Seed random
  connectWiFi();
}

void loop() {

  // Generate data dummy
  float suhu = randomFloat(27.0, 30.0);
  float ntu  = randomFloat(0.0, 12.0);
  float ph   = randomFloat(6.0, 8.0);

  Serial.println("===== DATA SENSOR =====");
  Serial.print("Suhu (C): ");
  Serial.println(suhu, 2);

  Serial.print("NTU: ");
  Serial.println(ntu, 2);

  Serial.print("pH: ");
  Serial.println(ph, 2);

  Serial.println("=======================\n");

  delay(5000); // kirim tiap 5 detik
}