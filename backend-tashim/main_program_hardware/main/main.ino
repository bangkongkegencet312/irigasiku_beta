// ====================================================================
// VERSI TERBARU: ESP32 + MQTT + PH + TDS + DS18B20 + TFT ST7735 LCD
// ====================================================================

// ======================
// LIBRARY
// ======================
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ST7735.h>

// ======================
// WIFI CONFIG
// ======================
const char* ssid = "XPR9FE";
const char* wifi_password = "a87acz6sczsay8t";

// ======================
// MQTT CONFIG
// ======================
const char* mqtt_server = "9575f087603642b38802e20db41742bf.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_username = "tetomiku";
const char* mqtt_password = "TetoMiku1";

// ======================
// PIN CONFIGURATION
// ======================
// Pin Sensor
#define PH_PIN       34
#define TDS_PIN      35
#define ONE_WIRE_BUS 13

// Pin TFT LCD ST7735
#define TFT_CS       27
#define TFT_DC       2
#define TFT_RST      33
#define TFT_MOSI     23
#define TFT_SCLK     18

// ======================
// OBJECTS
// ======================
WiFiClientSecure espClient;
PubSubClient mqttClient(espClient);
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);
Adafruit_ST7735 tft = Adafruit_ST7735(TFT_CS, TFT_DC, TFT_RST);

// ======================
// KALIBRASI & VARIABEL
// ======================
float calibration_value = 21.34;

// ======================
// FUNGSI RATA-RATA ADC (Filter Noise)
// ======================
int getAverageADC(int pin) {
  int total = 0;
  for (int i = 0; i < 20; i++) {
    total += analogRead(pin);
    delay(10);
  }
  return total / 20;
}

// ======================
// WIFI CONNECT
// ======================
void setupWiFi() {
  Serial.println();
  Serial.print("Menghubungkan WiFi ");
  WiFi.begin(ssid, wifi_password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi Connected");
  Serial.println(WiFi.localIP());
}

// ======================
// MQTT CONNECT
// ======================
void reconnectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("Menghubungkan MQTT...");
    String clientID = "ESP32Client-";
    clientID += String(random(0xffff), HEX);

    if (mqttClient.connect(clientID.c_str(), mqtt_username, mqtt_password)) {
      Serial.println("MQTT Connected");
    } else {
      Serial.print("MQTT Failed rc=");
      Serial.println(mqttClient.state());
      delay(5000);
    }
  }
}

// ======================
// SETUP
// ======================
void setup() {
  Serial.begin(115200);

  // KONFIGURASI ADC
  analogReadResolution(12);
  analogSetPinAttenuation(PH_PIN, ADC_11db);
  analogSetPinAttenuation(TDS_PIN, ADC_11db);

  // KONFIGURASI SPI MANUAL & TFT LCD
  SPI.begin(TFT_SCLK, -1, TFT_MOSI, TFT_CS);
  tft.initR(INITR_BLACKTAB);
  tft.setRotation(1);
  tft.fillScreen(ST77XX_BLACK);
  tft.setTextWrap(false);
  tft.setTextColor(ST77XX_WHITE);
  tft.setTextSize(2);

  // Loading Screen Awal
  tft.setCursor(10, 10);
  tft.println("STARTING...");

  // SENSOR SUHU
  sensors.begin();

  // KONEKSI WIFI
  setupWiFi();

  // SSL CONFIG (HiveMQ Cloud)
  espClient.setInsecure();

  // CONFIG MQTT
  mqttClient.setServer(mqtt_server, mqtt_port);

  Serial.println("System Ready");
  tft.fillScreen(ST77XX_BLACK);
}

// ======================
// LOOP
// ======================
void loop() {
  // Pastikan MQTT tetap terhubung
  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();

  // ==========================================
  // 1. BACA SENSOR SUHU (DS18B20)
  // ==========================================
  sensors.requestTemperatures();
  float temperature = sensors.getTempCByIndex(0);

  // ==========================================
  // 2. BACA SENSOR PH (Dengan Kalibrasi)
  // ==========================================
  int adcPH = getAverageADC(PH_PIN);
  float voltagePH = adcPH * (3.3 / 4095.0);
  float phValue = -5.70 * voltagePH + calibration_value;

  // ==========================================
  // 3. BACA SENSOR TDS (Dengan Kompensasi Suhu)
  // ==========================================
  int adcTDS = getAverageADC(TDS_PIN);
  float voltageTDS = adcTDS * (3.3 / 4095.0);

  // Kompensasi Suhu TDS
  float compensationCoefficient = 1.0 + 0.02 * (temperature - 25.0);
  float compensationVoltage = voltageTDS / compensationCoefficient;

  // Rumus Kubikasi TDS Kalibrasi v1
  float tdsValue = (
    133.42 * compensationVoltage * compensationVoltage * compensationVoltage
    - 255.86 * compensationVoltage * compensationVoltage
    + 857.39 * compensationVoltage
  ) * 0.5;

  // Filter Nilai Negatif
  if (tdsValue < 0) {
    tdsValue = 0;
  }

  // ==========================================
  // 4. MQTT PUBLISH
  // ==========================================
  mqttClient.publish("sensor/ph", String(phValue, 2).c_str());
  mqttClient.publish("sensor/tds", String(tdsValue, 0).c_str());
  mqttClient.publish("sensor/suhu", String(temperature, 2).c_str());

  // ==========================================
  // 5. SERIAL MONITOR OUTPUT
  // ==========================================
  Serial.println("========== DATA ==========");
  Serial.print("PH      : "); Serial.println(phValue, 2);
  Serial.print("TDS     : "); Serial.print(tdsValue, 0); Serial.println(" ppm");
  Serial.print("Suhu    : "); Serial.print(temperature, 1); Serial.println(" C");
  Serial.println("==========================");

  // ==========================================
  // 6. TFT LCD ST7735 DISPLAY OUTPUT
  // ==========================================
  tft.fillScreen(ST77XX_BLACK); // Clear Layar
  tft.setTextSize(2);

  // Tampilkan pH
  tft.setCursor(0, 10);
  tft.print("PH : ");
  tft.println(phValue, 2);

  // Tampilkan TDS
  tft.setCursor(0, 40);
  tft.print("TDS:");
  tft.print(tdsValue, 0);
  tft.println("ppm");

  // Tampilkan Suhu
  tft.setCursor(0, 70);
  tft.print("TMP:");
  tft.print(temperature, 1);
  tft.println("C");

  // Interval Loop (2 Detik)
  delay(2000);
}