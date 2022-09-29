import { get, noop } from "lodash";
import React, { useCallback, useState } from "react";
import styled, { useTheme } from "styled-components";

import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import { Popover2 } from "@blueprintjs/popover2";

import { ControlIcons } from "icons/ControlIcons";
import { FormIcons } from "icons/FormIcons";
import { Page } from "@appsmith/constants/ReduxActionConstants";
import { Toggle } from "design-system";
import { Action } from "./PageListItem";
import EditName from "./EditName";
import { useSelector } from "react-redux";

import {
  getCurrentApplicationId,
  getPagePermissions,
} from "selectors/editorSelectors";
import { Colors } from "constants/Colors";
import { TooltipComponent } from "design-system";
import { createMessage, SETTINGS_TOOLTIP } from "@appsmith/constants/messages";
import { TOOLTIP_HOVER_ON_DELAY } from "constants/AppConstants";
import {
  isPermitted,
  PERMISSION_TYPE,
} from "pages/Applications/permissionHelpers";

// render over popover portals
const Container = styled.div`
  padding: 12px;
  padding-top: 6px;

  /* min width to be 280px i.e. 17.5rem to wrap long page names */
  max-width: inherit;
  min-width: 17.5rem;

  background-color: ${Colors.GREY_1};

  h4 {
    margin: 0;
    margin-top: 8px;
    margin-bottom: 10px;
    font-weight: normal;
    font-size: 16px;
  }

  main {
    padding: 4px;
  }

  & .ContextMenuPopOver .ContextMenu {
    width: 10rem;
  }

  & .editing {
    width: 10rem;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
`;

const MenuItem = styled.div`
  display: flex;
  margin-top: 14px;
  align-items: center;

  & > div {
    flex-grow: 1;
    font-size: 14px;
  }

  &[aria-disabled="true"] {
    cursor: not-allowed;
    pointer-events: none;
  }
`;

const MenuItemToggle = styled(Toggle)`
  flex-basis: 48px;
  height: 23px;
  transform: scale(0.85);

  input:checked + .slider {
    background-color: ${Colors.GREY_10};
  }

  &[aria-disabled="true"] {
    cursor: not-allowed;
    pointer-events: none;
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;

  & > button {
    margin-left: 0px;
  }
`;

const PageName = styled.div`
  flex-grow: 1;

  & > h1 {
    font-weight: normal;
    margin: 0;
    font-size: 14px;
    width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const DeleteIcon = FormIcons.DELETE_ICON;
const CloseIcon = ControlIcons.CLOSE_CONTROL;
const CopyIcon = ControlIcons.COPY_CONTROL;
const SettingsIcon = ControlIcons.SETTINGS_CONTROL;

type Props = {
  page: Page;
  onSetPageHidden: () => void;
  onCopy: (pageId: string) => void;
  onDelete: (pageId: string, pageName: string) => void;
  onSetPageDefault: (pageId: string, applicationId?: string) => void;
};

function ContextMenu(props: Props) {
  const { onCopy, onDelete, onSetPageDefault, onSetPageHidden, page } = props;
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const applicationId = useSelector(getCurrentApplicationId);

  /**
   * opens the context menu on interaction ( on click )
   */
  const handleInteraction = useCallback((isOpen) => {
    setIsOpen(isOpen);
  }, []);

  const pagePermissions = useSelector(getPagePermissions);

  const canManagePages = isPermitted(
    pagePermissions,
    PERMISSION_TYPE.MANAGE_PAGES,
  );

  const canDeletePages = isPermitted(
    pagePermissions,
    PERMISSION_TYPE.DELETE_PAGES,
  );

  return (
    <Popover2
      content={
        <Container>
          <Header>
            <PageName>
              <div className="ContextMenuPopOver">
                {canManagePages && <EditName page={page} />}
              </div>
            </PageName>
            <Actions>
              <Action>
                <CopyIcon
                  color={Colors.GREY_9}
                  disabled={!canManagePages}
                  height={16}
                  onClick={!canManagePages ? noop : () => onCopy(page.pageId)}
                  width={16}
                />
              </Action>
              <Action>
                <DeleteIcon
                  color={
                    page.isDefault
                      ? get(theme, "colors.propertyPane.deleteIconColor")
                      : Colors.GREY_9
                  }
                  disabled={page.isDefault || !canDeletePages}
                  height={16}
                  onClick={
                    page.isDefault || !canDeletePages
                      ? noop
                      : () => onDelete(page.pageId, page.pageName)
                  }
                  width={16}
                />
              </Action>
              <Action>
                <CloseIcon
                  color={
                    page.isDefault
                      ? get(theme, "colors.propertyPane.deleteIconColor")
                      : Colors.GREY_9
                  }
                  height={16}
                  onClick={() => setIsOpen(false)}
                  width={16}
                />
              </Action>
            </Actions>
          </Header>
          <main>
            <h4>General</h4>
            {!page.isDefault && (
              <MenuItem aria-disabled={!canManagePages}>
                <div>Set Homepage</div>
                <MenuItemToggle
                  disabled={!canManagePages}
                  onToggle={() => onSetPageDefault(page.pageId, applicationId)}
                  value={page.isDefault}
                />
              </MenuItem>
            )}

            <MenuItem aria-disabled={!canManagePages}>
              <div>Visible</div>
              <MenuItemToggle
                disabled={!canManagePages}
                onToggle={onSetPageHidden}
                value={!page.isHidden}
              />
            </MenuItem>
          </main>
        </Container>
      }
      isOpen={isOpen}
      minimal
      onInteraction={handleInteraction}
      placement="bottom-start"
      portalClassName="pages-editor-context-menu"
    >
      <TooltipComponent
        content={createMessage(SETTINGS_TOOLTIP)}
        hoverOpenDelay={TOOLTIP_HOVER_ON_DELAY}
        position="bottom"
      >
        <Action className={isOpen ? "active" : ""} type="button">
          <SettingsIcon
            color={Colors.GREY_9}
            height={16}
            onClick={noop}
            width={16}
          />
        </Action>
      </TooltipComponent>
    </Popover2>
  );
}

export default ContextMenu;
