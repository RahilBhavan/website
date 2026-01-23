---
title: "Pothole Detection Drone for Zimbabwe's Roads"
description: "An autonomous drone system using YOLOv8 computer vision and ArduPilot telemetry to detect and map potholes in real-time, helping municipal infrastructure maintenance in Bulawayo."
problem: "Driving in Bulawayo, Zimbabwe often felt like navigating a minefield. Hidden potholes disrupt supply chains and endanger lives. The local City Council couldn't fix what they couldn't find—manual road inspections were slow, expensive, and incomplete."
solution: "Built a custom drone with CNC aluminum airframe, Raspberry Pi 5 edge computing, and YOLOv8 AI to autonomously detect potholes in real-time. The system syncs GPS coordinates with computer vision detections, creating an instant map of road defects for municipal maintenance teams."
demoUrl: "https://www.youtube.com/watch?v=LpTeKHJ6wRc"
githubUrl: ""
completedDate: 2024-06-15
---

# Pothole Detection Drone for Zimbabwe's Roads

## Overview

**What it is:** An autonomous drone system that uses computer vision and GPS telemetry to detect and map potholes in real-time. The system combines a custom-built drone airframe, Raspberry Pi 5 edge computing, YOLOv8 AI model, and ArduPilot flight controller to create a flying infrastructure inspection tool.

**Why it matters:** Road maintenance in Zimbabwe faces critical challenges—manual inspections are slow, expensive, and often miss defects until they become dangerous. This system automates the discovery process, enabling municipal teams to prioritize repairs based on real-time data rather than reactive complaints.

**Who it's for:** Municipal infrastructure teams, city councils, and transportation departments who need efficient, cost-effective road inspection capabilities. The system is particularly valuable in resource-constrained environments where traditional inspection methods are impractical.

**Impact:** The project won **2nd Place** at the Zimbabwe International Trade Fair (ZITF), was presented to the **President of Zimbabwe**, and engaged with industry leaders at **Econet Wireless**. It demonstrated that low-cost, high-tech solutions can address real infrastructure challenges in developing economies.

## The Problem

### The Challenge

Driving in Bulawayo, Zimbabwe often felt like navigating a minefield. A hidden pothole doesn't just ruin a tire; it disrupts supply chains and endangers lives. The local City Council faced a massive challenge—they couldn't fix what they couldn't find.

**Specific issues:**
- Manual road inspections were slow and expensive
- Many potholes went undetected until they caused accidents
- No systematic way to prioritize repairs
- Limited resources for comprehensive road surveys
- Time lag between defect formation and detection

**Who was affected:**
- Drivers and commuters facing dangerous road conditions
- Municipal maintenance teams with limited inspection capacity
- Supply chain operators dealing with vehicle damage
- City councils needing data-driven maintenance planning

**Consequences of not solving it:**
- Continued road deterioration
- Increased vehicle maintenance costs
- Safety risks from undetected hazards
- Inefficient allocation of repair resources
- Delayed response to infrastructure needs

### Why It Matters

Road infrastructure is critical for economic development and public safety. In Zimbabwe, where resources are limited, efficient maintenance is essential. The inability to quickly identify and prioritize road defects leads to:

- **Economic impact**: Vehicle damage, supply chain disruptions, increased transportation costs
- **Safety impact**: Accidents, injuries, and fatalities from undetected hazards
- **Resource waste**: Reactive repairs are more expensive than proactive maintenance
- **Development delays**: Poor infrastructure hinders economic growth

### Existing Solutions

**Traditional approaches:**
- **Manual inspections**: Teams drive roads looking for defects (slow, expensive, incomplete)
- **Citizen reports**: Relying on public complaints (reactive, inconsistent coverage)
- **Periodic surveys**: Scheduled comprehensive inspections (infrequent, resource-intensive)

**Why they're insufficient:**
- Too slow to catch defects early
- Don't provide systematic coverage
- Require significant human resources
- Can't scale to cover large road networks
- Miss defects in hard-to-reach areas

**Gap identified:**
- No real-time, automated detection system
- No systematic mapping of road conditions
- No integration of location data with visual detection
- No cost-effective solution for resource-constrained environments

### Constraints & Requirements

**Technical constraints:**
- Limited access to components (no Amazon in Zimbabwe)
- Need for rugged, vibration-resistant design
- Real-time processing requirements (edge computing on Raspberry Pi)
- GPS precision needed for accurate mapping
- Power and weight limitations for flight

**Time constraints:**
- Project timeline from concept to ZITF presentation
- Need for rapid prototyping and iteration
- Integration of multiple systems (hardware, software, AI)

**Resource constraints:**
- Limited budget for components
- Reliance on "runners" bringing parts from South Africa
- Access to local CNC machining and 3D printing
- Single developer working on multiple subsystems

**User constraints:**
- Municipal teams need simple, actionable data
- System must work in Zimbabwe's network conditions (Econet cellular)
- Must be deployable by non-technical operators
- Results must integrate with existing municipal workflows

## The Solution

### Approach & Methodology

The solution combines three key innovations:

1. **Custom Hardware Design**: Built a vibration-resistant drone frame using CNC aluminum and 3D printing, optimized for computer vision stability
2. **Edge AI Processing**: Deployed YOLOv8 on Raspberry Pi 5 for real-time pothole detection without requiring cloud connectivity
3. **Telemetry Synchronization**: Integrated ArduPilot flight controller with computer vision to sync GPS coordinates with detections

**Methodology:**
- **Iterative prototyping**: Multiple frame iterations using 3D printing for rapid testing
- **Transfer learning**: Used pre-trained YOLOv8 model fine-tuned on pothole detection dataset
- **Master-Slave architecture**: Separated flight control (Cube Orange) from vision processing (Raspberry Pi)
- **Real-time data streaming**: Cellular connectivity for live data upload during flight

### Technology Stack

**Hardware:**
- **Flight Controller**: Cube Orange with Here3 GPS (RTK-ready precision)
- **Edge Computer**: Raspberry Pi 5 (increased inference speed over Pi 4)
- **Connectivity**: 5G/LTE Cellular HAT with Econet SIM card
- **Frame**: Custom CNC aluminum build plate + 3D printed components (Ender 3)
- **Camera**: Standard Pi Camera or USB camera

**Software:**
- **AI Model**: YOLOv8 Nano (optimized for edge inference)
- **Flight Control**: ArduPilot firmware
- **Communication**: MAVLink protocol via UART (`/dev/ttyAMA0` at 921600 baud)
- **Vision Library**: Ultralytics YOLOv8, OpenCV
- **Telemetry**: DroneKit Python library

**Tools & Services:**
- **CAD**: Fusion 360 for frame design
- **3D Printing**: Ender 3 for rapid prototyping
- **CNC Machining**: Local machining for aluminum components
- **Dataset**: Potholes-Detection-YOLOv8 from Kaggle (1,500+ annotated images)

**Why this stack:**
- **Raspberry Pi 5**: Fast enough for real-time YOLO inference, affordable, widely available
- **YOLOv8 Nano**: Balances accuracy and speed for edge deployment
- **ArduPilot**: Industry-standard, well-documented, supports custom integrations
- **CNC Aluminum**: Provides rigidity needed for stable computer vision
- **Cellular connectivity**: Enables real-time data upload without waiting for landing

### Architecture & Design Decisions

**Architecture pattern:** Master-Slave separation
- **Master (Cube Orange)**: Handles flight physics, stability, motor control
- **Slave (Raspberry Pi)**: Processes vision, syncs with telemetry, uploads data

**Key design decisions:**

1. **Vibration Dampening**: Used rubber inserts to isolate Raspberry Pi and Cube Orange from frame vibrations, critical for accelerometer/gyrometer calibration
2. **Direct UART Connection**: Hardwired connection at 921600 baud eliminates USB latency for real-time telemetry
3. **Nano Model Selection**: Chose YOLOv8 Nano over larger models to prioritize FPS over marginal accuracy gains
4. **Asynchronous Uploads**: Network calls pushed to separate threads to never block video processing loop

**Trade-offs:**
- **Accuracy vs Speed**: Nano model trades slight accuracy for significant FPS improvement
- **Cost vs Performance**: Custom CNC aluminum more expensive than carbon fiber but provides needed rigidity
- **Simplicity vs Features**: Focused on core detection rather than advanced features

**Scalability considerations:**
- System designed for fleet deployment
- Cloud API endpoint for centralized data aggregation
- Modular design allows component upgrades

### Key Features

1. **Real-Time Pothole Detection**: YOLOv8 processes video feed at flight speed, detecting potholes with >50% confidence threshold
2. **GPS Synchronization**: Precise location data synced with each detection using Here3 RTK-ready GPS
3. **Live Data Upload**: Cellular connectivity (Econet 4G/LTE) enables real-time data streaming to cloud API
4. **Autonomous Operation**: Fully autonomous flight with pre-programmed waypoints
5. **Vibration-Resistant Design**: Custom frame and dampening ensure stable camera feed for accurate detection

## Technical Highlights

### Core Detection Pipeline

```python
# Simplified core logic
from dronekit import connect
from ultralytics import YOLO

# Initialize systems
vehicle = connect('/dev/ttyAMA0', baud=921600)
model = YOLO('pothole_v8_nano.pt')

# Detection loop
while True:
    frame = camera.read()
    results = model(frame)
    
    for detection in results:
        if detection.confidence > 0.5:
            # Get GPS immediately
            telemetry = {
                "lat": vehicle.location.global_frame.lat,
                "lon": vehicle.location.global_frame.lon,
                "alt": vehicle.location.global_relative_frame.alt
            }
            # Upload to cloud
            upload_detection(telemetry, detection)
```

**Key Technical Decisions:**

1. **UART at 921600 baud**: Eliminates USB latency for sub-second telemetry sync
2. **Nano model selection**: Optimized for Raspberry Pi 5 inference speed
3. **Confidence threshold at 0.5**: Balances false positives with detection coverage
4. **Immediate telemetry capture**: Gets GPS coordinates the moment pothole is detected (critical for accuracy at 15 m/s flight speed)

### Frame Design Philosophy

**Rigidity is King**: When building a drone for computer vision, vibration is the enemy. The custom CNC aluminum build plate provides the rigidity needed for stable sensor operation, while 3D printed components allow rapid iteration and customization.

**Vibration Dampening**: Rubber inserts isolate critical components (Raspberry Pi, Cube Orange) from frame vibrations, ensuring accurate sensor readings and stable flight.

## Process & Timeline

### Phase 1: Research & Planning

- **Duration:** 2-3 weeks
- **Activities:** 
  - Researching existing solutions and gaps
  - Evaluating hardware options (Raspberry Pi vs alternatives)
  - Selecting AI model architecture (YOLOv8 vs alternatives)
  - Understanding ArduPilot integration requirements
- **Key decisions:** 
  - Chose Raspberry Pi 5 for edge computing
  - Selected YOLOv8 Nano for speed/accuracy balance
  - Decided on Master-Slave architecture
- **Outcomes:** Technical feasibility confirmed, component list finalized

### Phase 2: Design & Development

- **Duration:** 6-8 weeks
- **Activities:**
  - CAD design in Fusion 360
  - Multiple frame iterations with 3D printing
  - CNC aluminum plate machining
  - Software integration (DroneKit, YOLOv8, MAVLink)
  - Vibration dampening optimization
- **Key milestones:**
  - First successful flight with stable video feed
  - First pothole detection with GPS sync
  - Real-time data upload working
- **Challenges encountered:**
  - Vibration issues affecting sensor calibration
  - Telemetry sync timing (2-second delay = 30m error at flight speed)
  - Network connectivity in Zimbabwe (Econet APN configuration)

### Phase 3: Testing & Refinement

- **Duration:** 2-3 weeks
- **Activities:**
  - Field testing on actual roads in Bulawayo
  - Accuracy validation against manual inspections
  - Performance optimization (FPS improvements)
  - Integration testing with municipal workflows
- **Iterations:** 3 major frame revisions, multiple software optimizations
- **Final polish:** 
  - Optimized confidence thresholds
  - Improved error handling
  - Enhanced data format for municipal use

### Major Milestones

- **Milestone 1:** First successful pothole detection with GPS coordinates (Week 6)
- **Milestone 2:** Real-time data upload working via cellular (Week 8)
- **Milestone 3:** Partnership with Bulawayo City Council (Week 10)
- **Milestone 4:** ZITF 2nd Place Award (Week 12)
- **Milestone 5:** Presentation to President of Zimbabwe (Week 14)

## Challenges & Solutions

### Challenge 1: Vibration Affecting Computer Vision

**The Problem:** Initial frame design caused excessive vibration, making computer vision unreliable and affecting flight controller sensor calibration.

**Why it was difficult:** Balancing weight, rigidity, and vibration dampening while working with limited materials and tools in Zimbabwe.

**The Solution:** 
- Designed custom CNC aluminum build plate for rigidity
- Implemented rubber vibration dampeners for Raspberry Pi and Cube Orange
- Used calipers for precise component placement
- Multiple frame iterations to optimize balance

**What I learned:** Vibration is the enemy of edge computing on drones. Every component placement matters, and isolation is critical for sensor accuracy.

### Challenge 2: Telemetry Synchronization Timing

**The Problem:** When the camera detects a pothole, we need the exact GPS coordinate of that millisecond. A 2-second delay means the drone (flying at 15 m/s) is 30 meters away from the actual defect.

**Why it was difficult:** Multiple systems (camera, AI model, flight controller, GPS) all operating at different latencies needed precise synchronization.

**The Solution:**
- Direct UART connection at 921600 baud (eliminates USB latency)
- Immediate telemetry capture the moment detection occurs
- Optimized detection loop to minimize processing delay
- Asynchronous uploads so network doesn't block detection

**What I learned:** Real-time systems require careful attention to latency at every layer. Direct hardware connections are essential for sub-second synchronization.

### Challenge 3: Resource Constraints in Zimbabwe

**The Problem:** Limited access to components, no Amazon, reliance on "runners" bringing parts from South Africa, limited local manufacturing capabilities.

**Why it was difficult:** Every component choice had to consider availability, cost, and local alternatives. Rapid iteration was challenging.

**The Solution:**
- Used locally available components where possible (CMU F450 base frame)
- Leveraged 3D printing for rapid iteration
- Found local CNC enthusiast for aluminum machining
- Designed for repairability with standard components

**What I learned:** Innovation in resource-constrained environments requires creativity, local partnerships, and designing for what's available rather than what's ideal.

## Visual Elements

**Screenshots & Demos:**
- Technical breakdown video: [YouTube](https://www.youtube.com/watch?v=LpTeKHJ6wRc)
- ZITF display showing drone at Bulawayo City Council stand
- Presentation to President of Zimbabwe
- Econet leadership presentation

**Diagrams:**
- System architecture showing Master-Slave separation
- Data flow from camera → AI → GPS sync → cloud upload
- Frame design with vibration dampening components

## Results & Metrics

### Quantifiable Outcomes

**Performance metrics:**
- **Detection accuracy**: >85% on test dataset
- **Processing speed**: Real-time inference on Raspberry Pi 5
- **GPS precision**: RTK-ready Here3 GPS for sub-meter accuracy
- **Flight time**: 20-25 minutes per battery (sufficient for road surveys)

**Impact metrics:**
- **ZITF Award**: 2nd Place for Innovation
- **Recognition**: Presented to President of Zimbabwe
- **Industry engagement**: Partnership discussions with Econet Wireless
- **Media coverage**: Featured in Herald Online and Bulawayo24

**Technical metrics:**
- **Frame iterations**: 3 major revisions
- **3D prints**: Hundreds of test prints to optimize design
- **Detection confidence**: 50% threshold optimized for field conditions

### User Feedback

> "This system could revolutionize how we maintain our roads. Having real-time data on road conditions allows us to prioritize repairs based on actual need rather than complaints."  
> — Bulawayo City Council Representative

> "The integration of AI with flight telemetry is impressive. This could have applications beyond potholes—minefield detection, agriculture, infrastructure inspection."  
> — Econet Wireless Leadership

### Impact & Value Delivered

**What value did this project create?**
- Demonstrated that low-cost, high-tech solutions can address infrastructure challenges
- Provided proof-of-concept for autonomous infrastructure inspection
- Created a replicable system for other municipalities
- Showed Zimbabwe's technical capability on a national stage

**How did it improve the situation?**
- Automated a previously manual, time-intensive process
- Enabled systematic road condition mapping
- Provided data-driven approach to maintenance prioritization
- Reduced inspection costs and time

**What changed as a result?**
- Increased visibility of infrastructure innovation in Zimbabwe
- Opened discussions with industry leaders (Econet) about smart city applications
- Validated edge computing approach for resource-constrained environments
- Inspired similar projects in other sectors

**What opportunities did it unlock?**
- Potential applications in minefield detection
- Agricultural monitoring and data collection
- Broader smart city infrastructure initiatives
- Internship opportunity at Econet Wireless

## Learnings

### What Worked Well

- **Master-Slave architecture**: Separating flight control from vision processing provided stability and flexibility
- **Rapid prototyping with 3D printing**: Allowed quick iteration and testing of frame designs
- **YOLOv8 transfer learning**: Pre-trained model significantly accelerated development
- **Direct UART connection**: Eliminated latency issues for real-time telemetry sync
- **Partnership approach**: Working with Bulawayo City Council provided validation and real-world testing

### What Didn't Work

- **Initial frame design**: First iterations had vibration issues requiring multiple redesigns
- **USB connection**: Too much latency for precise GPS sync, had to switch to UART
- **Larger YOLO models**: Too slow on Raspberry Pi, had to use Nano version
- **Synchronous uploads**: Blocked detection loop, had to make asynchronous

### What I'd Do Differently

- **Start with vibration analysis**: Would have saved time on frame iterations
- **Test telemetry sync earlier**: Critical timing issue discovered late in development
- **Documentation**: Better documentation during development would have helped
- **Smaller frame**: Would transition to smaller, more efficient frame design
- **Better print quality**: Improve 3D printing setup for higher quality components

**Key Insights:**

- **Edge computing is essential**: Real-time AI on-device enables applications impossible with cloud-only approaches
- **Hardware-software co-design**: Frame design directly impacts software performance
- **Resource constraints drive innovation**: Limited access forced creative solutions
- **Partnerships amplify impact**: City Council partnership provided validation and platform

## Next Steps

### Future Improvements

- **Smaller frame design**: More efficient, longer flight times
- **Improved AI model**: Fine-tune on Zimbabwe-specific road conditions
- **Multi-defect detection**: Expand beyond potholes to cracks, markings, signage
- **Automated reporting**: Generate maintenance reports directly from detection data
- **Fleet deployment**: Scale to multiple drones for comprehensive coverage

### Potential Iterations

- **Minefield detection**: Adapt system for landmine detection in conflict zones
- **Agricultural monitoring**: Crop health, irrigation, pest detection
- **Infrastructure inspection**: Bridges, buildings, power lines
- **5G integration**: Real-time cloud processing with Econet 5G network
- **Smart city platform**: Integrate with broader municipal data systems

### Ongoing Work

The project demonstrated proof-of-concept and received significant recognition. Future development would focus on:
- Production-ready refinements
- Integration with municipal maintenance workflows
- Scaling for fleet deployment
- Expanding detection capabilities

## Links & Resources

- **Technical Video**: [YouTube - Technical Breakdown](https://www.youtube.com/watch?v=LpTeKHJ6wRc)
- **News Coverage**: 
  - [Herald Online](https://www.heraldonline.co.zw/comment-young-minds-must-create-solutions-that-will-drive-zimbabwe-forward/)
  - [Bulawayo24](https://bulawayo24.com/index-id-news-sc-national-byo-245074.html)
- **Blog Series**: 
  - [Part 1: Mechanical Engineering](/blog/why-i-built-a-drone-for-zimbabwes-roads-part-1/)
  - [Part 2: AI Integration](/blog/the-eye-in-the-sky-integrating-ai-with-flight-telemetry-part-2-3/)
  - [Part 3: ZITF & Recognition](/blog/from-prototype-to-president-showcasing-innovation-at-zitf-part-3-3/)

---

**Completed:** June 15, 2024
