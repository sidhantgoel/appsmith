import React, { useEffect, useRef } from "react";
import {
  Button,
  Divider,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  Text,
} from "design-system";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import {
  getCanvasWidgets,
  getDatasources,
  getPageActions,
} from "selectors/entitiesSelector";
import { useIsWidgetActionConnectionPresent } from "pages/Editor/utils";
import { getEvaluationInverseDependencyMap } from "selectors/dataTreeSelectors";
import { INTEGRATION_TABS } from "constants/routes";
import {
  getApplicationLastDeployedAt,
  getCurrentApplicationId,
  getCurrentPageId,
} from "selectors/editorSelectors";
import history from "utils/history";
import {
  setSignpostingOverlay,
  showSignpostingModal,
  toggleInOnboardingWidgetSelection,
} from "actions/onboardingActions";
import { ReduxActionTypes } from "@appsmith/constants/ReduxActionConstants";
import {
  getFirstTimeUserOnboardingComplete,
  getSignpostingStepStateByStep,
} from "selectors/onboardingSelectors";
import AnalyticsUtil from "utils/AnalyticsUtil";
import { forceOpenWidgetPanel } from "actions/widgetSidebarActions";
import { bindDataOnCanvas } from "actions/pluginActionActions";
import {
  ONBOARDING_CHECKLIST_ACTIONS,
  ONBOARDING_CHECKLIST_HEADER,
  ONBOARDING_CHECKLIST_CONNECT_DATA_SOURCE,
  ONBOARDING_CHECKLIST_CREATE_A_QUERY,
  ONBOARDING_CHECKLIST_ADD_WIDGETS,
  ONBOARDING_CHECKLIST_CONNECT_DATA_TO_WIDGET,
  ONBOARDING_CHECKLIST_DEPLOY_APPLICATIONS,
  createMessage,
  SIGNPOSTING_POPUP_SUBTITLE,
  SIGNPOSTING_INFO_MENU,
  SIGNPOSTING_SUCCESS_POPUP,
} from "@appsmith/constants/messages";
import type { Datasource } from "entities/Datasource";
import type { ActionDataState } from "reducers/entityReducers/actionsReducer";
import type { CanvasWidgetsReduxState } from "reducers/entityReducers/canvasWidgetsReducer";
import { SIGNPOSTING_STEP } from "./Utils";
import { builderURL, integrationEditorURL } from "RouteBuilder";
import { DatasourceCreateEntryPoints } from "constants/Datasource";
import classNames from "classnames";
import lazyLottie from "utils/lazyLottie";
import tickMarkAnimationURL from "assets/lottie/guided-tour-tick-mark.json.txt";
import { getAppsmithConfigs } from "@appsmith/configs";
const { intercomAppID } = getAppsmithConfigs();

const StyledDivider = styled(Divider)`
  display: block;
`;

const PrefixCircle = styled.div<{ disabled: boolean }>`
  height: 13px;
  width: 13px;
  border-radius: 50%;
  border: 1px solid
    ${(props) =>
      !props.disabled
        ? "var(--ads-v2-color-bg-brand-secondary)"
        : "var(--ads-v2-color-fg-subtle)"};
`;

const LottieAnimationContainer = styled.div`
  height: 36px;
  width: 36px;
  left: -12px;
  top: -13px;
  position: absolute;
`;

const LottieAnimationWrapper = styled.div`
  height: 13px;
  width: 13px;
  position: relative;
`;

const ListItem = styled.div<{ disabled: boolean }>`
  &:hover {
    background-color: ${(props) =>
      !props.disabled ? "var(--ads-v2-color-bg-subtle)" : "transparent"};
  }
  padding: var(--ads-v2-spaces-3);
  padding-right: var(--ads-v2-spaces-2);
  border-radius: var(--ads-v2-border-radius);
  cursor: ${(props) => (!props.disabled ? "pointer" : "not-allowed")};

  // Strikethrought animation
  .signposting-strikethrough {
    position: relative;
  }
  .signposting-strikethrough-static {
    text-decoration: line-through;
  }
  .signposting-strikethrough:after {
    content: " ";
    position: absolute;
    top: 50%;
    left: 0;
    width: 0;
    height: 1px;
    background: black;
    animation-duration: 2s;
    animation-fill-mode: forwards;
  }
  .signposting-strikethrough::after {
    -webkit-animation-name: bounceInLeft;
    animation-name: bounceInLeft;
  }
  .signposting-strikethrough-bold::after {
    -webkit-animation-name: signposting-strikethrough-bold;
    animation-name: signposting-strikethrough-bold;
  }
  .signposting-strikethrough-normal::after {
    -webkit-animation-name: signposting-strikethrough-normal;
    animation-name: signposting-strikethrough-normal;
  }
  @keyframes signposting-strikethrough-bold {
    0% {
      width: 0;
    }
    50% {
      width: 100%;
    }
    100% {
      width: 100%;
    }
  }
  @keyframes signposting-strikethrough-normal {
    30% {
      width: 0;
    }
    100% {
      width: 100%;
    }
  }
`;

function getSuggestedNextActionAndCompletedTasks(
  datasources: Datasource[],
  actions: ActionDataState,
  widgets: CanvasWidgetsReduxState,
  isConnectionPresent: boolean,
  isDeployed: boolean,
) {
  let suggestedNextAction;
  if (!datasources.length) {
    suggestedNextAction = createMessage(
      () => ONBOARDING_CHECKLIST_ACTIONS.CONNECT_A_DATASOURCE,
    );
  } else if (!actions.length) {
    suggestedNextAction = createMessage(
      () => ONBOARDING_CHECKLIST_ACTIONS.CREATE_A_QUERY,
    );
  } else if (Object.keys(widgets).length === 1) {
    suggestedNextAction = createMessage(
      () => ONBOARDING_CHECKLIST_ACTIONS.ADD_WIDGETS,
    );
  } else if (!isConnectionPresent) {
    suggestedNextAction = createMessage(
      () => ONBOARDING_CHECKLIST_ACTIONS.CONNECT_DATA_TO_WIDGET,
    );
  } else if (!isDeployed) {
    suggestedNextAction = createMessage(
      () => ONBOARDING_CHECKLIST_ACTIONS.DEPLOY_APPLICATIONS,
    );
  }
  let completedTasks = 0;

  if (datasources.length) {
    completedTasks++;
  }
  if (actions.length) {
    completedTasks++;
  }
  if (Object.keys(widgets).length > 1) {
    completedTasks++;
  }
  if (isConnectionPresent) {
    completedTasks++;
  }
  if (isDeployed) {
    completedTasks++;
  }

  return { suggestedNextAction, completedTasks };
}

function CheckListItem(props: {
  boldText: string;
  normalPrefixText?: string;
  normalText: string;
  onClick: () => void;
  disabled: boolean;
  completed: boolean;
  step: SIGNPOSTING_STEP;
  docLink?: string;
}) {
  const stepState = useSelector((state) =>
    getSignpostingStepStateByStep(state, props.step),
  );
  const tickMarkRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (props.completed) {
      const anim = lazyLottie.loadAnimation({
        path: tickMarkAnimationURL,
        container: tickMarkRef?.current as HTMLDivElement,
        renderer: "svg",
        loop: false,
        autoplay: false,
      });
      if (!stepState?.read) {
        anim.play();
      } else {
        anim.goToAndStop(60, true);
      }

      return () => {
        anim.destroy();
      };
    }
  }, [tickMarkRef?.current, props.completed, stepState?.read]);

  return (
    <div className="flex pt-2 flex-1 flex-col">
      <ListItem
        className={classNames({
          "flex items-center justify-between": true,
        })}
        disabled={props.disabled}
        onClick={
          props.completed
            ? () => null
            : () => {
                props.onClick();
              }
        }
      >
        <div className="flex items-center gap-2.5">
          {props.completed ? (
            <LottieAnimationWrapper>
              <LottieAnimationContainer ref={tickMarkRef} />
            </LottieAnimationWrapper>
          ) : (
            <PrefixCircle disabled={props.disabled} />
          )}
          <div>
            <Text
              className={classNames({
                "signposting-strikethrough-bold":
                  props.completed && !stepState?.read,
                "signposting-strikethrough-static":
                  props.completed && stepState?.read,
                "signposting-strikethrough": true,
              })}
              color={
                !props.disabled
                  ? "var(--ads-v2-color-bg-brand-secondary)"
                  : "var(--ads-v2-color-fg-subtle)"
              }
              kind="heading-xs"
            >
              {props.boldText}
              {props.normalPrefixText && (
                <Text
                  color={!props.disabled ? "" : "var(--ads-v2-color-fg-subtle)"}
                >
                  &nbsp;{props.normalPrefixText}
                </Text>
              )}
            </Text>
            <br />
            <Text
              className={classNames({
                "signposting-strikethrough-normal":
                  props.completed && !stepState?.read,
                "signposting-strikethrough-static":
                  props.completed && stepState?.read,
                "signposting-strikethrough": true,
              })}
              color={!props.disabled ? "" : "var(--ads-v2-color-fg-subtle)"}
            >
              {props.normalText}
            </Text>
          </div>
        </div>
        <Menu
          onOpenChange={(open) => {
            if (open) {
              AnalyticsUtil.logEvent("SIGNPOSTING_INFO_CLICK", {
                step: props.step,
              });
            }
          }}
        >
          <MenuTrigger disabled={props.disabled}>
            <Button
              isDisabled={props.disabled}
              isIconButton
              kind="tertiary"
              startIcon="question-line"
            />
          </MenuTrigger>
          <MenuContent
            align="end"
            collisionPadding={10}
            onCloseAutoFocus={(e) => {
              e.preventDefault();
            }}
          >
            <MenuItem
              disabled={props.disabled}
              onClick={(e) => {
                window.open(
                  props.docLink ?? "https://docs.appsmith.com/",
                  "_blank",
                );
                e?.stopPropagation();
              }}
              startIcon="book-line"
            >
              {createMessage(SIGNPOSTING_INFO_MENU.documentation)}
            </MenuItem>
          </MenuContent>
        </Menu>
      </ListItem>
      <StyledDivider className="mt-0.5" />
    </div>
  );
}

export default function OnboardingChecklist() {
  const dispatch = useDispatch();
  const datasources = useSelector(getDatasources);
  const pageId = useSelector(getCurrentPageId);
  const actions = useSelector(getPageActions(pageId));
  const widgets = useSelector(getCanvasWidgets);
  const deps = useSelector(getEvaluationInverseDependencyMap);
  const isConnectionPresent = useIsWidgetActionConnectionPresent(
    widgets,
    actions,
    deps,
  );
  const applicationId = useSelector(getCurrentApplicationId);
  const isDeployed = !!useSelector(getApplicationLastDeployedAt);
  const { completedTasks } = getSuggestedNextActionAndCompletedTasks(
    datasources,
    actions,
    widgets,
    isConnectionPresent,
    isDeployed,
  );
  const isFirstTimeUserOnboardingComplete = useSelector(
    getFirstTimeUserOnboardingComplete,
  );
  const onconnectYourWidget = () => {
    const action = actions[0];
    dispatch(showSignpostingModal(false));
    if (action && applicationId && pageId) {
      dispatch(
        bindDataOnCanvas({
          queryId: action.config.id,
          applicationId,
          pageId,
        }),
      );
    } else {
      history.push(builderURL({ pageId }));
    }
    AnalyticsUtil.logEvent("SIGNPOSTING_MODAL_CONNECT_WIDGET_CLICK");
  };

  useEffect(() => {
    if (intercomAppID && window.Intercom) {
      // Close signposting modal when intercom modal is open
      window.Intercom("onShow", () => {
        dispatch(showSignpostingModal(false));
      });
    }

    return () => {
      dispatch({
        type: "SIGNPOSTING_MARK_ALL_READ",
      });
      dispatch(setSignpostingOverlay(false));
    };
  }, []);

  // End signposting for the application once signposting is complete and the
  // signposting complete menu is closed
  useEffect(() => {
    return () => {
      if (isFirstTimeUserOnboardingComplete) {
        dispatch({
          type: ReduxActionTypes.END_FIRST_TIME_USER_ONBOARDING,
        });
      }
    };
  }, [isFirstTimeUserOnboardingComplete]);

  // Success UI
  if (isFirstTimeUserOnboardingComplete) {
    return (
      <>
        <div className="flex justify-between pb-4 gap-6">
          <Text
            className="flex-1"
            color="var(--ads-v2-color-fg-emphasis)"
            kind="heading-m"
          >
            {createMessage(SIGNPOSTING_SUCCESS_POPUP.title)}
          </Text>
          <Button
            isIconButton
            kind="tertiary"
            onClick={() => {
              dispatch(showSignpostingModal(false));
            }}
            startIcon={"close-line"}
          />
        </div>
        <Text color="var(--ads-v2-color-bg-brand-secondary)" kind="heading-xs">
          {createMessage(SIGNPOSTING_SUCCESS_POPUP.subtitle)}
        </Text>
        <StyledDivider className="mt-4" />
      </>
    );
  }

  return (
    <>
      <div className="flex justify-between pb-4">
        <Text color="var(--ads-v2-color-fg-emphasis)" kind="heading-m">
          {createMessage(ONBOARDING_CHECKLIST_HEADER)}
        </Text>
        {/* TODO: size looks small */}
        <Button
          isIconButton
          kind="tertiary"
          onClick={() => {
            AnalyticsUtil.logEvent("SIGNPOSTING_MODAL_CLOSE_CLICK");
            dispatch(showSignpostingModal(false));
          }}
          startIcon={"close-line"}
        />
      </div>
      <Text color="var(--ads-v2-color-bg-brand-secondary)" kind="heading-xs">
        {createMessage(SIGNPOSTING_POPUP_SUBTITLE)}
      </Text>
      <div className="mt-5">
        <Text color="var(--ads-v2-color-bg-brand-secondary)" kind="heading-xs">
          {completedTasks} of 5{" "}
        </Text>
        <Text>complete</Text>
      </div>
      <StyledDivider className="mt-1" />
      <CheckListItem
        boldText={createMessage(ONBOARDING_CHECKLIST_CONNECT_DATA_SOURCE.bold)}
        completed={!!(datasources.length || actions.length)}
        disabled={false}
        docLink="https://docs.appsmith.com/core-concepts/connecting-to-data-sources"
        normalText={createMessage(
          ONBOARDING_CHECKLIST_CONNECT_DATA_SOURCE.normal,
        )}
        onClick={() => {
          AnalyticsUtil.logEvent("SIGNPOSTING_MODAL_CREATE_DATASOURCE_CLICK", {
            from: "CHECKLIST",
          });
          dispatch(showSignpostingModal(false));
          history.push(
            integrationEditorURL({
              pageId,
              selectedTab: INTEGRATION_TABS.NEW,
            }),
          );
        }}
        step={SIGNPOSTING_STEP.CONNECT_A_DATASOURCE}
      />
      <CheckListItem
        boldText={createMessage(ONBOARDING_CHECKLIST_CREATE_A_QUERY.bold)}
        completed={!!actions.length}
        disabled={!datasources.length && !actions.length}
        docLink="https://docs.appsmith.com/core-concepts/data-access-and-binding/querying-a-database"
        normalPrefixText={createMessage(
          ONBOARDING_CHECKLIST_CREATE_A_QUERY.normalPrefix,
        )}
        normalText={createMessage(ONBOARDING_CHECKLIST_CREATE_A_QUERY.normal)}
        onClick={() => {
          AnalyticsUtil.logEvent("SIGNPOSTING_MODAL_CREATE_QUERY_CLICK", {
            from: "CHECKLIST",
          });
          dispatch(showSignpostingModal(false));
          history.push(
            integrationEditorURL({
              pageId,
              selectedTab: INTEGRATION_TABS.ACTIVE,
            }),
          );
          // Event for datasource creation click
          const entryPoint = DatasourceCreateEntryPoints.NEW_APP_CHECKLIST;
          AnalyticsUtil.logEvent("NAVIGATE_TO_CREATE_NEW_DATASOURCE_PAGE", {
            entryPoint,
          });
        }}
        step={SIGNPOSTING_STEP.CREATE_A_QUERY}
      />
      <CheckListItem
        boldText={createMessage(ONBOARDING_CHECKLIST_ADD_WIDGETS.bold)}
        completed={Object.keys(widgets).length > 1}
        disabled={false}
        docLink="https://docs.appsmith.com/reference/widgets"
        normalText={createMessage(ONBOARDING_CHECKLIST_ADD_WIDGETS.normal)}
        onClick={() => {
          AnalyticsUtil.logEvent("SIGNPOSTING_MODAL_ADD_WIDGET_CLICK", {
            from: "CHECKLIST",
          });
          dispatch(showSignpostingModal(false));
          dispatch(toggleInOnboardingWidgetSelection(true));
          dispatch(forceOpenWidgetPanel(true));
          history.push(builderURL({ pageId }));
        }}
        step={SIGNPOSTING_STEP.ADD_WIDGETS}
      />
      <CheckListItem
        boldText={createMessage(
          ONBOARDING_CHECKLIST_CONNECT_DATA_TO_WIDGET.bold,
        )}
        completed={isConnectionPresent}
        disabled={Object.keys(widgets).length === 1 || !actions.length}
        docLink="https://docs.appsmith.com/core-concepts/data-access-and-binding/displaying-data-read"
        normalText={createMessage(
          ONBOARDING_CHECKLIST_CONNECT_DATA_TO_WIDGET.normal,
        )}
        onClick={onconnectYourWidget}
        step={SIGNPOSTING_STEP.CONNECT_DATA_TO_WIDGET}
      />
      <CheckListItem
        boldText={createMessage(ONBOARDING_CHECKLIST_DEPLOY_APPLICATIONS.bold)}
        completed={isDeployed}
        disabled={false}
        normalText={createMessage(
          ONBOARDING_CHECKLIST_DEPLOY_APPLICATIONS.normal,
        )}
        onClick={() => {
          AnalyticsUtil.logEvent("SIGNPOSTING_MODAL_PUBLISH_CLICK", {
            from: "CHECKLIST",
          });
          dispatch(showSignpostingModal(false));
          dispatch({
            type: ReduxActionTypes.PUBLISH_APPLICATION_INIT,
            payload: {
              applicationId,
            },
          });
        }}
        step={SIGNPOSTING_STEP.DEPLOY_APPLICATIONS}
      />
    </>
  );
}
