#include "HX711.h"

#define DOUT 16
#define CLK 17

HX711 scale;

long tareRaw = 139900;
float calFactor = 100.0;

long readAverage(int samples) {
  long sum = 0;
  int count = 0;

  for (int i = 0; i < samples; i++) {
    if (scale.is_ready()) {
      sum += scale.read();
      count++;
    }
    delay(5);
  }

  if (count == 0) return 0;
  return sum / count;
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  scale.begin(DOUT, CLK);

  Serial.println("BeeCare PocketScale FAST");
  Serial.println("t = tara");
  Serial.println("c 230 = kalibriraj s trenutno maso 230 g");
}

void loop() {
  if (!scale.is_ready()) {
    Serial.println("HX711 ni zaznan");
    delay(300);
    return;
  }

  long raw = readAverage(8);
  long delta = raw - tareRaw;

  float grams = delta / calFactor;

  // zaokrozi na 5 g
  int roundedGrams = round(grams / 5.0) * 5;

  // ignoriraj šum okoli nule
  if (abs(roundedGrams) < 5) roundedGrams = 0;

  Serial.print("Raw: ");
  Serial.print(raw);

  Serial.print(" | Delta: ");
  Serial.print(delta);

  Serial.print(" | Teza: ");
  Serial.print(roundedGrams);
  Serial.println(" g");

  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();

    if (cmd == "t") {
      tareRaw = readAverage(20);
      Serial.print("TARA: ");
      Serial.println(tareRaw);
    }

    if (cmd.startsWith("c ")) {
      float knownGrams = cmd.substring(2).toFloat();
      long currentRaw = readAverage(20);
      calFactor = (currentRaw - tareRaw) / knownGrams;

      Serial.print("CAL: ");
      Serial.println(calFactor, 4);
    }
  }

  delay(200);
}