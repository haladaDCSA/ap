function loadModel(modelName) {
    console.log('تحميل النموذج: ' + modelName);
    const modelPath = `E:/astro-ai-website/GPT4All/models/${modelName}`;
    try {
        gptA4all.loadModel(modelPath);
        // إضافة منطق للتفاعل مع الذكاء الصناعي
        // هنا يمكنك استدعاء دالة لإرسال الرسالة إلى النموذج
    } catch (error) {
        console.error('خطأ في تحميل النموذج:', error);
    }
}
