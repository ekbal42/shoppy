import React from "react";

export const stageColors: Record<ApplicationStage, string> = {
  APPLIED: "blue",
  UNDER_REVIEW: "yellow",
  INTERVIEW: "purple",
  AWAITING_PAYMENT: "orange",
  IN_QUEUE: "gray",
  ON_TRIAL: "pink",
  HIRED: "green",
  CLOSED: "red",
  REJECTED: "red",
};

interface Props {
  stage: ApplicationStage;
}

const StageBadge: React.FC<Props> = ({ stage }) => {
  return (
    <span
      className={`px-3 border py-1 rounded-full text-sm font-medium 
        bg-${stageColors[stage]}-100 text-${stageColors[stage]}-700`}
    >
      {stage
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase())}
    </span>
  );
};

export default StageBadge;

export enum ApplicationStage {
  APPLIED = "APPLIED",
  UNDER_REVIEW = "UNDER_REVIEW",
  INTERVIEW = "INTERVIEW",
  AWAITING_PAYMENT = "AWAITING_PAYMENT",
  IN_QUEUE = "IN_QUEUE",
  ON_TRIAL = "ON_TRIAL",
  HIRED = "HIRED",
  CLOSED = "CLOSED",
  REJECTED = "REJECTED",
}

export const stageOptions = Object.values(ApplicationStage).map((stage) => ({
  value: stage,
  label: stage
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase()),
}));
