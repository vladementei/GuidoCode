#---------------------- training data ----------------------------------------------
#from imageai.Detection.Custom import DetectionModelTrainer
#areseses
#trainer= DetectionModelTrainer()
#trainer.setModelTypeAsYOLOv3()
#trainer.setDataDirectory(data_directory="notes")
#trainer.setTrainConfig(object_names_array=["line"],batch_size=4,num_experiments=100,train_from_pretrained_model="pretrained-yolov3.h5")
#trainer.trainModel()

#----------------------------- checking data --------------------------------------
#from imageai.Detection.Custom import DetectionModelTrainer

#trainer = DetectionModelTrainer()
#trainer.setModelTypeAsYOLOv3()
#trainer.setDataDirectory(data_directory="notes")
#trainer.evaluateModel(model_path="notes/models", json_path="notes/json/detection_config.json",
#                     iou_threshold=0.5, object_threshold=0.3, nms_threshold=0.6)

# ----------------------------- final tests -----------------------------------------
from imageai.Detection.Custom import CustomObjectDetection

detector = CustomObjectDetection()
detector.setModelTypeAsYOLOv3()
detector.setModelPath("detection_model-ex-003--loss-0021.776.h5")
detector.setJsonPath("detection_config.json")
detector.loadModel()
detections = detector.detectObjectsFromImage(input_image="test1_notes.png", output_image_path="detected.png")
print(detections)