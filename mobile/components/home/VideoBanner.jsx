import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';

const VIDEO_HEIGHT = 200; // Adjust height as needed

export const VideoBanner = () => {
    const { width } = useWindowDimensions();
    const videoSource = require('../../assets/videos/banner.mp4');
    
    const player = useVideoPlayer(videoSource, (playerInstance) => {
        playerInstance.loop = true;
        playerInstance.muted = true;
        playerInstance.play();
    });

    return (
        <View style={[styles.container, { width }]}>
            <VideoView
                style={styles.video}
                player={player}
                contentFit="cover"
                nativeControls={false}
            />

            {/* Gradient Overlay for Fade Effect */}
            <LinearGradient
                colors={[
                    'rgba(255,255,255,0)',
                    'rgba(255,255,255,0.01)',
                    'rgba(255,255,255,0.1)',
                    'rgba(255,255,255,0.4)',
                    'rgba(255,255,255,0.8)',
                    'rgba(255,255,255,1)'
                ]}
                style={styles.gradient}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: VIDEO_HEIGHT,
        position: 'relative',
        marginBottom: 20,
    },
    video: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '50%', // Gradient covers bottom half
    },
});

