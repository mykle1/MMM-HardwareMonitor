/* Magic Mirror
 * Module: MMM-HardwareMonitor
 *
 * By Mykle1
 *
 */
Module.register("MMM-HardwareMonitor", {

    defaults: {
        videoCard: "NVIDIA GeForce GTX660", // name of your video card
        useHeader: false,
        header: "",
        maxWidth: "300px",
        animationSpeed: 0,
        initialLoadDelay: 3250,
        retryDelay: 2500,
        updateInterval: 60 * 1000,
        surprise: "",
    },

    isa_adapter: {},
    pci_adapter: {},

    getStyles: function() {
        return ["MMM-HardwareMonitor.css"];
    },

    getScripts: function() {

        return ["moment.js"];
    },


    start: function() {
        Log.info("Starting module: " + this.name);
        this.Stats = {};
        this.Sensors = {};
        this.Terminal = {};
        this.scheduleUpdate();
    },


    getDom: function() {

        var wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        wrapper.style.maxWidth = this.config.maxWidth;

        if (!this.loaded) {
            wrapper.innerHTML = this.translate("Scanning CPU and RAM . . .");
            wrapper.classList.add("bright", "small");
            return wrapper;
        }

        if (this.config.useHeader != false) {
            var header = document.createElement("header");
            header.classList.add("small", "bright", "header");
            header.innerHTML = this.config.header;
            wrapper.appendChild(header);
        }

        var Stats = this.Stats;
        var Sensors = this.Sensors;
        var Terminal = this.Terminal;


        var pic = document.createElement("div");
        var img = document.createElement("img");
        img.classList.add("RAMimg");
        img.src = "modules/MMM-HardwareMonitor/images/RAM5.jpg";
        pic.appendChild(img);
        wrapper.appendChild(pic);

        // total RAM
        var totalRAM = document.createElement("div");
        totalRAM.classList.add("small", "bright", "totalRAM");
        totalRAM.innerHTML = "Total RAM = " + Stats.ram.total + Stats.ram.unit;
        wrapper.appendChild(totalRAM);


        // Free RAM
        var freeRAM = document.createElement("div");
        freeRAM.classList.add("small", "bright", "freeRAM");
        freeRAM.innerHTML = "Free RAM = " + Stats.ram.free + Stats.ram.unit;
        wrapper.appendChild(freeRAM);


        // Your CPU and CPU speed
        var yourCPU = document.createElement("div");
        yourCPU.classList.add("small", "bright", "yourCPU");
        yourCPU.innerHTML = Stats.cpu.name;
        wrapper.appendChild(yourCPU);

        var pic = document.createElement("div");
        var img = document.createElement("img");
        img.classList.add("CPUimg");
        img.src = "modules/MMM-HardwareMonitor/images/cpu33.jpg";
        pic.appendChild(img);
        wrapper.appendChild(pic);

        // CPU threads header
        var threadsHeader = document.createElement("div");
        threadsHeader.classList.add("medium", "bright", "threadsHeader");
        threadsHeader.innerHTML = "Threads and Usage";
        wrapper.appendChild(threadsHeader);

        // spacer
        var spacer = document.createElement("div");
        spacer.classList.add("small", "bright", "spacer");
        spacer.innerHTML = "~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~";
        wrapper.appendChild(spacer);


        // dynamically create cpu threads and system load
        for (var i = 0, len = Stats.cpu.threads.length; i < len; i++) {
            var Element = document.createElement("div");
            Element.classList.add("small", "bright", "usage");
            Element.innerHTML = Stats.cpu.threads[i].name + " &nbsp  @  &nbsp " +
                Number(Math.round(Stats.cpu.threads[i].usage + 'e2') + 'e-2') + "%";
            wrapper.appendChild(Element);
        }

        var pic = document.createElement("div");
        var img = document.createElement("img");
        img.classList.add("COREimg");
        img.src = "modules/MMM-HardwareMonitor/images/core.gif";
        pic.appendChild(img);
        wrapper.appendChild(pic);


        var pic = document.createElement("div");
        var img = document.createElement("img");
        img.classList.add("GPUimg");
        img.src = "modules/MMM-HardwareMonitor/images/gpu1.png";
        pic.appendChild(img);
        wrapper.appendChild(pic);



        // Check if Graphics cpu has temp sensor
        var graphicsTempCheck = this.pci_adapter;
        if (typeof graphicsTempCheck !== 'undefined') {

            // remove the plus sign, the decimal point and 10ths digit from video card temps
            var decimal = this.pci_adapter.temp1.current;
            dataString = decimal.split('+').join(''); // remove the plus sign
            finish = dataString.split('.0').join(''); // remove the decimal and tenths digit

            // graphicsTemp
            var graphicsTemp = document.createElement("div");
            graphicsTemp.classList.add("small", "bright", "graphicsTemp");
            graphicsTemp.innerHTML = this.config.videoCard; // + " temp @ " + finish; // + "&deg;C";
            wrapper.appendChild(graphicsTemp);

        }

        // loop thru any available cores..
        // max cores - 8
        for (var i = 0; i < 8; i++) {
            let c = "Core " + i;
            try {
                if (this.isa_adapter[c] !== "undefined") {

                    // remove the plus sign, the decimal point and 10ths digit from core temps
                    var decimal2 = this.isa_adapter[c].current;
                    dataString = decimal2.split('+').join(''); // remove the plus sign
                    finish2 = dataString.split('.0').join(''); // remove the decimal and tenths digit



                    var newElement = document.createElement("div");
                    newElement.classList.add("small", "bright", "core" + i + "Temp");
                    newElement.innerHTML = c + " &nbsp  @  &nbsp " + finish2; // + "&deg;C";
                    wrapper.appendChild(newElement);
                } else
                    break;
            } catch (exception) {
                // catch the reference error for 'Core 4' etc..
                break;
            }
        }


        var pic = document.createElement("div");
        var img = document.createElement("img");
        img.classList.add("MOBOimg");
        img.src = "modules/MMM-HardwareMonitor/images/mobo2.png";
        pic.appendChild(img);
        wrapper.appendChild(pic);

        // GPU fan speed
        gpuFan = document.createElement("div");
        gpuFan.classList.add("small", "bright", "gpuFan");
        gpuFan.innerHTML = "GPU fan speed = " + Sensors["nouveau-pci-0100"].fan1;
        wrapper.appendChild(gpuFan);

        // GPU current temp
        // remove the plus sign, the decimal point and 10ths digit from GPU temp
        var decimal3 = Sensors["nouveau-pci-0100"].temp1.current;
        dataString = decimal3.split('+').join(''); // remove the plus sign
        finish3 = dataString.split('.0').join(''); // remove the decimal and tenths digit

        gpuTemp = document.createElement("div");
        gpuTemp.classList.add("small", "bright", "gpuTemp");
        gpuTemp.innerHTML = "GPU temp = " + finish3;
        wrapper.appendChild(gpuTemp);


        // GPU temp high
        // remove the plus sign, the decimal point and 10ths digit from GPU temp high
        var decimal4 = Sensors["nouveau-pci-0100"].temp1.limits["0"].high;
        dataString = decimal4.split('+').join(''); // remove the plus sign
        finish4 = dataString.split('.0').join(''); // remove the decimal and tenths digit

        gpuTempHigh = document.createElement("div");
        gpuTempHigh.classList.add("small", "bright", "gpuTempHigh");
        gpuTempHigh.innerHTML = "GPU temp high = " + finish4;
        wrapper.appendChild(gpuTempHigh);


        // GPU temp critical
        // remove the plus sign, the decimal point and 10ths digit from GPU temp high
        var decimal5 = Sensors["nouveau-pci-0100"].temp1.limits[1].crit;
        dataString = decimal5.split('+').join(''); // remove the plus sign
        finish5 = dataString.split('.0').join(''); // remove the decimal and tenths digit

        gpuTempCritical = document.createElement("div");
        gpuTempCritical.classList.add("small", "bright", "gpuTempCritical");
        gpuTempCritical.innerHTML = "GPU temp critical = " + finish5;
        wrapper.appendChild(gpuTempCritical);


        // GPU temp emergency
        // remove the plus sign, the decimal point and 10ths digit from GPU temp high
        var decimal6 = Sensors["nouveau-pci-0100"].temp1.limits[2].emerg;
        dataString = decimal6.split('+').join(''); // remove the plus sign
        finish6 = dataString.split('.0').join(''); // remove the decimal and tenths digit

        gpuTempEmergency = document.createElement("div");
        gpuTempEmergency.classList.add("small", "bright", "gpuTempEmergency");
        gpuTempEmergency.innerHTML = "GPU temp emergency = " + finish6;
        wrapper.appendChild(gpuTempEmergency);


        var pic = document.createElement("div");
        var img = document.createElement("img");
        img.classList.add("FANimg");
        img.src = "modules/MMM-HardwareMonitor/images/Fan2.jpg";
        pic.appendChild(img);
        wrapper.appendChild(pic);


        // System fan1 speed
        moboFan1 = document.createElement("div");
        moboFan1.classList.add("small", "bright", "moboFan1");
        moboFan1.innerHTML = "System Fan #1 = " + Sensors["f71858fg-isa-0a00"].fan1;
        wrapper.appendChild(moboFan1);


        // System fan2 speed
        moboFan2 = document.createElement("div");
        moboFan2.classList.add("small", "bright", "moboFan2");
        moboFan2.innerHTML = "System Fan #2 = " + Sensors["f71858fg-isa-0a00"].fan2;
        wrapper.appendChild(moboFan2);


        // Mobo temp sensor1
        // remove the plus sign, the decimal point and 10ths digit from Mobo temp sensor1
        var decimal7 = Sensors["f71858fg-isa-0a00"].temp1.current;
        dataString = decimal7.split('+').join(''); // remove the plus sign
        finish7 = dataString.split('.0').join(''); // remove the decimal and tenths digit

        sens1 = document.createElement("div");
        sens1.classList.add("small", "bright", "sens1");
        sens1.innerHTML = "Mobo Temp Sensor #1 = " + finish7;
        wrapper.appendChild(sens1);


        // Mobo temp sensor1 hyst temp
        sens1Hyst = document.createElement("div");
        sens1Hyst.classList.add("small", "bright", "sens1Hyst");
        sens1Hyst.innerHTML = "HYST = 60 &deg;C &nbsp / &nbsp High = 70 &deg;C";
        wrapper.appendChild(sens1Hyst);


        // Mobo temp sensor2
        // remove the plus sign, the decimal point and 10ths digit from Mobo temp sensor2
        var decimal8 = Sensors["f71858fg-isa-0a00"].temp2.current;
        dataString = decimal8.split('+').join(''); // remove the plus sign
        finish8 = dataString.split('.0').join(''); // remove the decimal and tenths digit

        sens2 = document.createElement("div");
        sens2.classList.add("small", "bright", "sens2");
        sens2.innerHTML = "Mobo Temp Sensor #2 = " + finish8;
        wrapper.appendChild(sens2);


        // Mobo temp sensor2 hyst temp
        sens2Hyst = document.createElement("div");
        sens2Hyst.classList.add("small", "bright", "sens2Hyst");
        sens2Hyst.innerHTML = "HYST = 85 &deg;C &nbsp / &nbsp High = 100 &deg;C"
        wrapper.appendChild(sens2Hyst);


        // Mobo temp sensor3
        // remove the plus sign, the decimal point and 10ths digit from Mobo temp sensor3
        var decimal9 = Sensors["f71858fg-isa-0a00"].temp3.current;
        dataString = decimal9.split('+').join(''); // remove the plus sign
        finish9 = dataString.split('.0').join(''); // remove the decimal and tenths digit

        sensor3 = document.createElement("div");
        sensor3.classList.add("small", "bright", "sensor3");
        sensor3.innerHTML = "Mobo Temp Sensor #3 = " + finish9;
        wrapper.appendChild(sensor3);


        // Mobo temp sensor3 hyst temp
        sens3Hyst = document.createElement("div");
        sens3Hyst.classList.add("small", "bright", "sens3Hyst");
        sens3Hyst.innerHTML = "HYST = 85 &deg;C &nbsp / &nbsp High = 100 &deg;C"
        wrapper.appendChild(sens3Hyst);


        // Mobo 3.3V rail
        rail = document.createElement("div");
        rail.classList.add("small", "bright", "rail");
        rail.innerHTML = "3.3V rail = " + Sensors["f71858fg-isa-0a00"]["+3.3V"];
        wrapper.appendChild(rail);


        // Mobo standby power
        standby = document.createElement("div");
        standby.classList.add("small", "bright", "standby");
        standby.innerHTML = "3VSB = " + Sensors["f71858fg-isa-0a00"]["3VSB"];
        wrapper.appendChild(standby);


        // Mobo Vbat
        Vbat = document.createElement("div");
        Vbat.classList.add("small", "bright", "Vbat");
        Vbat.innerHTML = "Vbat = " + Sensors["f71858fg-isa-0a00"]["3VSB"];
        wrapper.appendChild(Vbat);


        // Surprise
        if (this.config.surprise == "yes") {
            var pic = document.createElement("div");
            var img = document.createElement("img");
            img.classList.add("QUIETimg");
            img.src = "modules/MMM-HardwareMonitor/images/quiet.jpg";
            pic.appendChild(img);
            wrapper.appendChild(pic);
        }

        return wrapper;

    },


    notificationReceived: function(notification, payload) {
        if (notification === 'HIDE_HARDWARE') {
            this.hide(1000);
        } else if (notification === 'SHOW_HARDWARE') {
            this.show(1000);
        }
    },

    processStats: function(data) {
        this.Stats = data;
        this.loaded = true;
        //  		console.log(this.Stats); // for checking in dev console
    },

    processSensors: function(data) {
        //var c = 'Core 0';
        this.Sensors = JSON.parse(data);
        //  console.log(this.Sensors); // for checking dev console
        // loop thru the primary keys of the object
        for (var prop in this.Sensors) {
            // if this key is found
            if (this.Sensors.hasOwnProperty(prop)) {
                // if this is an isa adapter		(watch out for case sensitivity)
                if (this.Sensors[prop].Adapter == 'ISA adapter') {
                    try {
                        // check to see if it has any cores, other ISA adapters do not!
                        if (this.Sensors[prop]['Core 0'] !== undefined) {
                            this.isa_adapter = this.Sensors[prop];
                            continue
                        }
                    } catch (exception) {
                        continue
                    }
                } // (watch out for case sensitivity)
                else if (this.Sensors[prop].Adapter == 'PCI adapter') {
                    this.pci_adapter = this.Sensors[prop];
                    continue
                }

            }
            //Do your logic with the property here
        }
        //        this.loaded = true;
        //        		console.log(this.Sensors); // for checking in dev console
    },

    processTerminal: function(data) {
        this.Terminal = data;
        //        this.loaded = true;
        //        		console.log(this.Terminal); // for checking in dev console
    },

    scheduleUpdate: function() {
        setInterval(() => {
            this.getStats();
        }, this.config.updateInterval);
        this.getStats(this.config.initialLoadDelay);
    },

    getStats: function() {
        this.sendSocketNotification('GET_STATS');
    },


    socketNotificationReceived: function(notification, payload) {
        if (notification === "STATS_RESULT") {
            this.processStats(payload);
            this.updateDom(this.config.animationSpeed);
        }
        if (notification === "SENSORS_RESULT") {
            this.processSensors(payload);
            this.updateDom(this.config.fadeSpeed);
        }
        if (notification === "TERMINAL_RESULT") {
            this.processTerminal(payload);
            this.updateDom(this.config.fadeSpeed);
        }
        this.updateDom(this.config.initialLoadDelay);
    },
});
