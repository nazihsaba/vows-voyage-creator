import { AbsoluteFill, Sequence } from "remotion";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { Scene1Intro } from "./scenes/Scene1Intro";
import { Scene2Templates } from "./scenes/Scene2Templates";
import { Scene3Form } from "./scenes/Scene3Form";
import { Scene4Preview } from "./scenes/Scene4Preview";
import { Scene5Dashboard } from "./scenes/Scene5Dashboard";
import { Scene6Links } from "./scenes/Scene6Links";
import { Scene7Outro } from "./scenes/Scene7Outro";

loadPlayfair();
loadMontserrat();

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={120}><Scene1Intro /></Sequence>
      <Sequence from={120} durationInFrames={110}><Scene2Templates /></Sequence>
      <Sequence from={230} durationInFrames={120}><Scene3Form /></Sequence>
      <Sequence from={350} durationInFrames={100}><Scene4Preview /></Sequence>
      <Sequence from={450} durationInFrames={100}><Scene5Dashboard /></Sequence>
      <Sequence from={550} durationInFrames={100}><Scene6Links /></Sequence>
      <Sequence from={650} durationInFrames={100}><Scene7Outro /></Sequence>
    </AbsoluteFill>
  );
};
