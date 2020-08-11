import { createCustomElement, actionTypes } from '@servicenow/ui-core';
import snabbdom from '@servicenow/ui-renderer-snabbdom';
import styles from './styles.scss';
import { createHttpEffect } from '@servicenow/ui-effect-http'
import '@servicenow/now-template-card'
import '@servicenow/now-dropdown'
import '@servicenow/now-modal'
const { COMPONENT_BOOTSTRAPPED } = actionTypes


const view = (state, { updateState }) => {
	const {incidents, modalOpened, selectedIncident} = state
	return (
		<div>
			<div className="incidents-container">
				{
					incidents.map(
						incident => {
							return (

								<now-template-card-assist
									tagline={{ "icon": "tree-view-long-outline", "label": "Incident: " + incident.number }}
									actions={[{ "id": "open", "label": "Open", 'incident': incident }, { "id": "delete", "label": "Delete", 'incident': incident }]}
									heading={{ "label": incident.short_description }}
									content={[{ "label": "State", "value": { "type": "string", "value": incident.state } },
									{ "label": "Assigned", "value": { "type": "string", "value": incident.assigned_to.display_value } },
									{ "label": "Caller", "value": { "type": "string", "value": incident.caller_id.display_value } },
									{ "label": "SLA", "value": { "type": "string", "value": "No SLA Set" } }]}
									footerContent={{ "label": "Updated", "value": "2019-01-15 08:41:09" }}
									configAria={{}}
									contentItemMinWidth="300">
								</now-template-card-assist>

							)
						})}
			</div>
			<now-modal
				opened={modalOpened}
				size='lg'
				header-label={`Incident: ${selectedIncident.number}`}
				content='And this is the body of the modal.'
				footer-actions='[
					{
						"variant": "primary",
						"label": "Save"
					}
    			]'
			/>
		</div>
	);
};

function openIncident(incident) {
	
}

createCustomElement('x-338485-x-frst', {
	renderer: { type: snabbdom },
	view,
	styles,
	initialState: { incidents: [], selectedIncident: {}, modalOpened: false },
	actionHandlers: {
		[COMPONENT_BOOTSTRAPPED]: (coeffects) => {
			const { dispatch } = coeffects;
			dispatch('FETCH_INCIDENTS', { sysparm_limit: 10, sysparm_display_value: true })
		},
		'FETCH_INCIDENTS': createHttpEffect('api/now/table/incident', {
			method: 'GET',
			queryParams: ['sysparm_limit', 'sysparm_display_value'],
			successActionType: 'FETCH_INCIDENT_SUCCESS'
		}),
		['FETCH_INCIDENT_SUCCESS']: ({ action, updateState }) => {
			const { result } = action.payload;
			const incidents = result;
			updateState({ incidents })
		},
		'NOW_DROPDOWN_PANEL#ITEM_CLICKED': ({action, updateState, dispatch}) => {
			const {payload} = action
			console.log(payload)
			if (payload.item.id == 'open'){
				updateState({selectedIncident: payload.item.incident, modalOpened: true});
			}else{
				dispatch('REMOVE_INCIDENT', { sys_id: payload.item.incident.sys_id })
			}
		},
		'REMOVE_INCIDENT': createHttpEffect('api/now/table/incident/:sys_id', {
			method: 'DELETE',
			pathParams: ['sys_id'],
			successActionType: 'REMOVE_INCIDENT_SUCCESS'
		}),
		['REMOVE_INCIDENT_SUCCESS']: ({dispatch}) => {
			console.log('incident removed')
			dispatch('FETCH_INCIDENTS', { sysparm_limit: 10, sysparm_display_value: true })
		}
	}
});
