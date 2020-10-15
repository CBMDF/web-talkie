const lis = document.querySelectorAll(".buttons-container li");
const a = document.querySelectorAll(".buttons-container li a");

for (let i = 0; i < lis.length; i++) {
  lis[i].addEventListener("click", function () {
    for (let i = 0; i < lis.length; i++) {
      lis[i].classList.remove("active");
      a[i].classList.remove("active-text");
    }
    this.classList.add("active");
    a[i].classList.add("active-text");
  });
}

function getBatteryLevel() {
  let isBatterySupported = "getBattery" in navigator;
  if (!isBatterySupported) {
    console.log("Battery not supported");
  } else {
    let batteryPromise = navigator.getBattery();
    batteryPromise.then((battery) => {
      console.log("Percentage", battery.level);
      batteryDiv = document.getElementById("battery").innerHTML =
        "Battery: " + battery.level * 100 + "%";
    });
  }
}
getBatteryLevel();
